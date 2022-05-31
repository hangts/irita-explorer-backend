import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {StakingHttp} from "../http/lcd/staking.http";
import {BlockHttp} from "../http/lcd/block.http";
import {Model} from "mongoose"
import {addressTransform, formatDateStringToNumber, getAddress, getTimestamp, hexToBech32} from "../util/util";
import {addressPrefix, moduleSlashing, TaskEnum, validatorStatusStr} from "../constant";
import { getConsensusPubkey } from '../helper/staking.helper';
import {CronTaskWorkingStatusMetric} from "../monitor/metrics/cron_task_working_status.metric";

@Injectable()
export class StakingValidatorInfoTaskService {
    constructor(@InjectModel('StakingSyncValidators') private stakingSyncValidatorsModel: Model<any>,
                @InjectModel('ParametersTask') private parametersTaskModel: Model<any>,
                private readonly cronTaskWorkingStatusMetric: CronTaskWorkingStatusMetric,
                private readonly stakingHttp: StakingHttp) {
        this.doTask = this.doTask.bind(this);
        this.cronTaskWorkingStatusMetric.collect(TaskEnum.stakingSyncValidatorsInfo,0)
    }

    async doTask(): Promise<void> {
        let pageNum = 1, pageSize = 1000, allValidatorsFromLcd = []
        let validatorsFromDb = await (this.stakingSyncValidatorsModel as any).queryAllValidators();
        let validatorsFromLcd_bonded = await this.stakingHttp.queryValidatorListFromLcd(validatorStatusStr.bonded ,pageNum, pageSize)
        let validatorsFromLcd_unbonded = await this.stakingHttp.queryValidatorListFromLcd(validatorStatusStr.unbonded, pageNum, pageSize)
        let validatorsFromLcd_unbonding = await this.stakingHttp.queryValidatorListFromLcd(validatorStatusStr.unbonding, pageNum, pageSize)
        allValidatorsFromLcd = [...(validatorsFromLcd_bonded || []),...(validatorsFromLcd_unbonded || []),...(validatorsFromLcd_unbonding || [])];
        if (!validatorsFromLcd_bonded || !allValidatorsFromLcd.length) {
            this.cronTaskWorkingStatusMetric.collect(TaskEnum.stakingSyncValidatorsInfo,-1)
            return;
        }
        // 处理数据
        if (allValidatorsFromLcd && Array.isArray(allValidatorsFromLcd) && allValidatorsFromLcd.length > 0) {
            await this.handDbValidators(allValidatorsFromLcd)
        }

        //设置map
        let validatorsFromDbMap = new Map()
        let allValidatorsFromLcdMap = new Map()

        allValidatorsFromLcd.forEach(item => {
            allValidatorsFromLcdMap.set(item.operator_address, item)
        })
        if (validatorsFromDb.length > 0) {
            validatorsFromDb.forEach(item => {
                validatorsFromDbMap.set(item.operator_address, item)
            })
        }
        let needInsertOrValidators = await StakingValidatorInfoTaskService.getInsertOrUpdateValidators(allValidatorsFromLcdMap, validatorsFromDbMap)
        let needDeleteValidators = await StakingValidatorInfoTaskService.getDeleteValidators(allValidatorsFromLcdMap, validatorsFromDbMap)
        await this.insertAndUpdateValidators(needInsertOrValidators)
        await this.deleteValidators(needDeleteValidators)
        this.cronTaskWorkingStatusMetric.collect(TaskEnum.stakingSyncValidatorsInfo,1)
    }

    private async handDbValidators(allValidatorsFromLcd) {
        const currentHeight = await BlockHttp.queryLatestBlockHeightFromLcd();
        for (let i = 0; i < allValidatorsFromLcd.length; i++) {
            if (allValidatorsFromLcd[i].commission && allValidatorsFromLcd[i].commission.update_time) {
                allValidatorsFromLcd[i].commission.update_time = formatDateStringToNumber(allValidatorsFromLcd[i].commission.update_time)
            }
            if (allValidatorsFromLcd[i].unbonding_time) {
                allValidatorsFromLcd[i].unbonding_time = formatDateStringToNumber(allValidatorsFromLcd[i].unbonding_time)
            }
            if (allValidatorsFromLcd[i].tokens) {
                allValidatorsFromLcd[i].voting_power = Number(allValidatorsFromLcd[i].tokens)
            }
            allValidatorsFromLcd[i].jailed = allValidatorsFromLcd[i].jailed || false
            allValidatorsFromLcd[i].consensus_pubkey = getConsensusPubkey(allValidatorsFromLcd[i].consensus_pubkey['key'])
            let BlockProposer = getAddress(allValidatorsFromLcd[i].consensus_pubkey)
            allValidatorsFromLcd[i].proposer_addr = BlockProposer ? BlockProposer.toLocaleUpperCase() : null
            await this.updateSlashInfo(allValidatorsFromLcd[i])
            await this.updateUpTime(allValidatorsFromLcd[i], currentHeight)
        }
    }

    static getDeleteValidators(allValidatorsFromLcdMap, validatorsFromDbMap) {
        if (validatorsFromDbMap.size !== 0) {
            let needDeleteValidatorDbMap = new Map()
            for (let key of validatorsFromDbMap.keys()) {
                if (!allValidatorsFromLcdMap.has(key)) {
                    needDeleteValidatorDbMap.set(validatorsFromDbMap.get(key).operator_address, validatorsFromDbMap.get(key))
                }
            }
            return needDeleteValidatorDbMap
        }
    }

    //获取需要插入及更新的validators
    static async getInsertOrUpdateValidators(allValidatorsFromLcdMap, validatorsFromDbMap) {
        //数据库中没有数据的情况
        let needInsertOrUpdate = new Map()
        for (let key of allValidatorsFromLcdMap.keys()) {
            let validator = allValidatorsFromLcdMap.get(key)
            // let validatorFromDb = validatorsFromDbMap.get(key)
            // if (validatorFromDb && validatorFromDb.is_black) {
            //     validator.moniker_m = validatorFromDb.moniker_m;
            //     validator.is_black = true;
            // } else {
            //     validator.is_black = false;
            //     validator.moniker_m = '';
            // }
            // validatorFromDb && validatorFromDb.icon ? validator.icon = validatorFromDb.icon : '';
            // validatorFromDb && validatorFromDb.delegator_num ? validator.delegator_num = validatorFromDb.delegator_num : '';
            // validatorFromDb && validatorFromDb.self_bond ? validator.self_bond = validatorFromDb.self_bond : '';
            validator.update_time = getTimestamp()
            if (!validatorsFromDbMap.has(key)) {
                validator.create_time = getTimestamp()
            }
            needInsertOrUpdate.set(validator.operator_address, validator)
        }
        return needInsertOrUpdate
    }

    private insertAndUpdateValidators(validatorsFromLcdMap) {
        if (validatorsFromLcdMap && validatorsFromLcdMap.size > 0) {
            validatorsFromLcdMap.forEach(async (validator) => {
                validator.tokens = Number(validator.tokens)
                await (this.stakingSyncValidatorsModel as any).insertValidator(validator)
            })
        }
    }

    private deleteValidators(validatorsFromDbMap) {
        if (validatorsFromDbMap && validatorsFromDbMap.size > 0) {
            validatorsFromDbMap.forEach(async (validator) => {
                await (this.stakingSyncValidatorsModel as any).deleteValidator(validator)
            })
        }
    }

    private async updateSlashInfo(dbValidators) {        
        if (dbValidators.consensus_pubkey) {
            let icaAddr = hexToBech32(getAddress(dbValidators.consensus_pubkey), addressPrefix.ica);
            let signingInfo = await this.stakingHttp.queryValidatorFormSlashing(icaAddr)
            let validatorObject = dbValidators
            validatorObject.index_offset = signingInfo && signingInfo.index_offset || 0;
            validatorObject.jailed_until = signingInfo && signingInfo.jailed_until ? formatDateStringToNumber(signingInfo.jailed_until) : '';
            validatorObject.start_height = signingInfo && signingInfo.start_height || 0;
            validatorObject.missed_blocks_counter = signingInfo && signingInfo.missed_blocks_counter || 0;
            validatorObject.tombstoned = signingInfo && signingInfo.tombstoned || false;
        }
    }

    private async updateUpTime(dbValidators,currentHeight) {
        const moduleName = moduleSlashing
        const signedBlocksWindow = await (this.parametersTaskModel as any).querySignedBlocksWindow(moduleName)     
        const startHeight = Number(dbValidators.start_height) || 0
        let diffCurrentStart = currentHeight - startHeight + 1
        let missedBlockCount = Number(dbValidators.missed_blocks_counter) || 0
        dbValidators.uptime = 1 - missedBlockCount / Math.min(diffCurrentStart, signedBlocksWindow.cur_value)
    }
}
