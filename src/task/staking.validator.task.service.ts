import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {StakingHttp} from "../http/lcd/staking.http";
import {Model} from "mongoose"
import {addressTransform, formatDateStringToNumber, getAddress, getTimestamp} from "../util/util";
import {addressPrefix, moduleSlashing} from "../constant";

@Injectable()

export class StakingValidatorTaskService {
    constructor(@InjectModel('StakingSyncValidators') private stakingSyncValidatorsModel: Model<any>,
                @InjectModel('ParametersTask') private parametersTaskModel: Model<any>,
                private readonly stakingHttp: StakingHttp) {
        this.doTask = this.doTask.bind(this);
    }

    async doTask(): Promise<void> {
        let pageNum = 1, pageSize = 100, allValidatorsFromLcd = []
        let validatorsFromDb = await (this.stakingSyncValidatorsModel as any).queryAllValidators();
        let validatorListDataFromLcd = await this.stakingHttp.queryValidatorListFromLcd(pageNum, pageSize)
        if (typeof validatorListDataFromLcd == 'undefined') {
            return
        }
        if (validatorListDataFromLcd && validatorListDataFromLcd.length > 0) {
            allValidatorsFromLcd = [...validatorListDataFromLcd];
        }
        //判断是否有第二页数据 如果有使用while循环请求
        while (allValidatorsFromLcd && allValidatorsFromLcd.length === pageSize) {
            pageNum++
            let nextPageValidatorsFromLcd = await this.stakingHttp.queryValidatorListFromLcd(pageNum, pageSize);
            //将第二页及以后的数据合并
            allValidatorsFromLcd = [...allValidatorsFromLcd ,...nextPageValidatorsFromLcd]
        }
        // 处理数据
        if (allValidatorsFromLcd && Array.isArray(allValidatorsFromLcd) && allValidatorsFromLcd.length > 0) {
            await this.handDbValidators(allValidatorsFromLcd)
        }

        //设置map
        let validatorsFromDbMap = new Map()
        let allValidatorsFromLcdMap = new Map()

        validatorListDataFromLcd.forEach(item => {
            allValidatorsFromLcdMap.set(item.operator_address, item)
        })
        if (validatorsFromDb.length > 0) {
            validatorsFromDb.forEach(item => {
                validatorsFromDbMap.set(item.operator_address, item)
            })
        }
        let needInsertOrValidators = await StakingValidatorTaskService.getInsertOrUpdateValidators(allValidatorsFromLcdMap, validatorsFromDbMap)
        let needDeleteValidators = await StakingValidatorTaskService.getDeleteValidators(allValidatorsFromLcdMap, validatorsFromDbMap)
        await this.insertAndUpdateValidators(needInsertOrValidators)
        await this.deleteValidators(needDeleteValidators)
    }

    private async handDbValidators(allValidatorsFromLcd) {
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
            const BlockProposer = getAddress(allValidatorsFromLcd[i].consensus_pubkey)
            allValidatorsFromLcd[i].proposer_addr = BlockProposer ? BlockProposer.toLocaleUpperCase() : null
            await this.updateSlashInfo(allValidatorsFromLcd[i])
            await this.updateSelfBond(allValidatorsFromLcd[i])
            await this.updateIcons(allValidatorsFromLcd[i])
            await this.updateUpTime(allValidatorsFromLcd[i])
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
            let signingInfo = await this.stakingHttp.queryValidatorFormSlashing(dbValidators.consensus_pubkey)
            let validatorObject = dbValidators
            validatorObject.index_offset = signingInfo.index_offset || 0;
            validatorObject.jailed_until = signingInfo && signingInfo.jailed_until ? formatDateStringToNumber(signingInfo.jailed_until) : '';
            validatorObject.start_height = signingInfo.start_height || 0;
            validatorObject.missed_blocks_counter = signingInfo.missed_blocks_counter || 0;
            validatorObject.tombstoned = signingInfo.tombstoned || '';
        }

    }

    private async updateSelfBond(dbValidators) {
        if (dbValidators.operator_address) {
            let valTranDelAddr = addressTransform(dbValidators.operator_address, addressPrefix.iaa)
            let selfBondData = await this.stakingHttp.querySelfBondFromLcd(dbValidators.operator_address)
            dbValidators.delegator_num = selfBondData.length;
            await selfBondData.forEach((item) => {
                if (item.delegation
                    && item.delegation.delegator_address
                    && valTranDelAddr === item.delegation.delegator_address) {
                    dbValidators.self_bond = item.balance
                }
            })
        }
    }

    private async updateIcons(dbValidators) {
        if (dbValidators.description && dbValidators.description.identity) {
            let validatorIconUrl = await this.stakingHttp.queryValidatorIcon(dbValidators.description.identity)
            if (validatorIconUrl.them
                && validatorIconUrl.them.pictures
                && validatorIconUrl.them.pictures.primary
                && validatorIconUrl.them.pictures.primary.url
                && validatorIconUrl.them.pictures.primary.url !== '') {
                dbValidators.icon = validatorIconUrl.them.pictures.primary.url
            }
        }
    }

    private async updateUpTime(dbValidators) {
        const moduleName = moduleSlashing
        const signedBlocksWindow = await (this.parametersTaskModel as any).querySignedBlocksWindow(moduleName)
        const currentHeight = Number(dbValidators.current_height) || 0
        const startHeight = Number(dbValidators.start_height) || 0
        let diffCurrentStart = currentHeight - startHeight + 1
        let missedBlockCount = Number(dbValidators.missed_blocks_counter) || 0
        dbValidators.uptime = 1 - missedBlockCount / Math.min(diffCurrentStart, signedBlocksWindow.cur_value)

    }
}
