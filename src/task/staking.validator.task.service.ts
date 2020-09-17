import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {StakingValidatorHttp} from "../http/lcd/staking.validator.http";
import {Model} from "mongoose"
import {addressTransform, formatDateStringToNumber, getTimestamp} from "../util/util";
import {IStakingValidatorDbMap, IStakingValidatorLcdMap} from "../types/schemaTypes/staking.validator.interface";
import {IValidatorsStruct} from "../types/schemaTypes/validators.interface";
import {addressPrefix} from "../constant";

@Injectable()

export class StakingValidatorTaskService {
    constructor(@InjectModel('StakingSyncValidators') private stakingSyncValidatorsModel: Model<any>,
                @InjectModel('ParametersTask') private parametersTaskModel: Model<any>,
                private readonly stakingValidatorHttp: StakingValidatorHttp) {
        this.doTask = this.doTask.bind(this);
    }

    async doTask(): Promise<void> {
        console.log('*****************************************')
        let pageNum = 1, pageSize = 100, allValidatorsFromLcd = []
        let validatorListDataFromLcd: [] = await this.stakingValidatorHttp.queryValidatorListFromLcd(pageNum, pageSize)
        if (typeof validatorListDataFromLcd == 'undefined') {
            return
        }
        if (validatorListDataFromLcd && validatorListDataFromLcd.length > 0) {
            allValidatorsFromLcd = allValidatorsFromLcd.concat(validatorListDataFromLcd);
        }
        //判断是否有第二页数据 如果有使用while循环请求
        while (allValidatorsFromLcd && allValidatorsFromLcd.length === pageSize) {
            pageNum++
            allValidatorsFromLcd = await this.stakingValidatorHttp.queryValidatorListFromLcd(pageNum, pageSize);
            //将第二页及以后的数据合并
            allValidatorsFromLcd = allValidatorsFromLcd.concat(allValidatorsFromLcd)
        }
        // 处理数据
        if (allValidatorsFromLcd && Array.isArray(allValidatorsFromLcd) && allValidatorsFromLcd.length > 0) {
            await this.handDbValidators(allValidatorsFromLcd)
        }

        //设置map
        let validatorsFromDb: [] = await (this.stakingSyncValidatorsModel as any).queryAllValidators();
        let needInsertOrValidators = await StakingValidatorTaskService.getInsertOrUpdateValidators(allValidatorsFromLcd, validatorsFromDb)
        let needDeleteValidators = await StakingValidatorTaskService.getDeleteValidators(allValidatorsFromLcd, validatorsFromDb)
        console.log(needInsertOrValidators,">>>>>>>>>>>>>>>>>???????????????????")
        await this.insertAndUpdateValidators(needInsertOrValidators)
        await this.deleteValidators(needDeleteValidators)
    }
    private async handDbValidators(allValidatorsFromLcd){
        for (let i = 0; i < allValidatorsFromLcd.length; i++){
             if(allValidatorsFromLcd[i].commission && allValidatorsFromLcd[i].commission.update_time){
                allValidatorsFromLcd[i].commission.update_time = formatDateStringToNumber(allValidatorsFromLcd[i].commission.update_time)
            }
             if (allValidatorsFromLcd[i].unbonding_time) {
                allValidatorsFromLcd[i].unbonding_time = formatDateStringToNumber(allValidatorsFromLcd[i].unbonding_time)
            }
             if (allValidatorsFromLcd[i].tokens) {
                allValidatorsFromLcd[i].voting_power = Number(allValidatorsFromLcd[i].tokens)
            }

            await this.updateSlashInfo(allValidatorsFromLcd[i])
            await this.updateSelfBond(allValidatorsFromLcd[i])
            await this.updateIcons(allValidatorsFromLcd[i])
            await this.updateUpTime(allValidatorsFromLcd[i])
        }
    }
    static getDeleteValidators(allValidatorsFromLcd, validatorsFromDb) {
        if(allValidatorsFromLcd.length !== 0 && validatorsFromDb !== 0){
            let  validatorsFromDbMap = new Map()
            let  allValidatorsFromLcdMap = new Map()
            allValidatorsFromLcdMap.forEach(item =>{
                allValidatorsFromLcdMap.set(item.operator_address,item)
            })

            validatorsFromDbMap.forEach( item => {
                validatorsFromDbMap.set(item.operator_address,item)
            })
            for (let key of validatorsFromDbMap) {
                if (!allValidatorsFromLcdMap.has(key)) {
                    return validatorsFromDbMap
                }
            }
        }
    }

    //获取需要插入及更新的validators
    static async getInsertOrUpdateValidators(allValidatorsFromLcd, validatorsFromDb) {
        //数据库中没有数据的情况
        let  validatorsFromDbMap = new Map()
        let  allValidatorsFromLcdMap = new Map()
        if(validatorsFromDb.length === 0){
            await allValidatorsFromLcd.forEach( item => {
                item.create_time = getTimestamp()
                allValidatorsFromLcdMap.set(item.operator_address,item)
            })
            return allValidatorsFromLcdMap
        }else {

            allValidatorsFromLcd.forEach(item =>{
                allValidatorsFromLcdMap.set(item.operator_address,item)
            })

            validatorsFromDb.forEach( item => {
                validatorsFromDbMap.set(item.operator_address,item)
            })

            for (let key of validatorsFromDbMap.keys()) {
                if (allValidatorsFromLcdMap.has(key)) {
                    const validatorWithUpdateTime = allValidatorsFromLcdMap.get(key)
                    validatorWithUpdateTime.update_time = getTimestamp()
                    return allValidatorsFromLcdMap.set(validatorWithUpdateTime.operator_address, validatorWithUpdateTime)
                } else {
                    allValidatorsFromLcd.forEach( item => {
                        item.create_time = getTimestamp()
                        allValidatorsFromLcdMap.set(item.operator_address,item)
                    })
                    return allValidatorsFromLcdMap
                }
            }
        }
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
            let signingInfo = await this.stakingValidatorHttp.queryValidatorFormSlashing(dbValidators.consensus_pubkey)
            let validatorObject = dbValidators
            validatorObject.index_offset = signingInfo.index_offset;
            validatorObject.jailed_until = formatDateStringToNumber(signingInfo.jailed_until);
            validatorObject.start_height = signingInfo.start_height;
            validatorObject.missed_blocks_counter = signingInfo.missed_blocks_counter;
            validatorObject.tombstoned = signingInfo.tombstoned;
        }

    }

    private async updateSelfBond(dbValidators) {
        if (dbValidators.operator_address) {
            let valTranDelAddr = addressTransform(dbValidators.operator_address, addressPrefix.iaa)
            let selfBondData = await this.stakingValidatorHttp.querySelfBondFromLcd(dbValidators.operator_address)
            dbValidators.delegator_num = selfBondData.length;
            await selfBondData.forEach((item) => {
                if(item.delegation
                    && item.delegation.delegator_address
                    && valTranDelAddr === item.delegation.delegator_address ){
                    dbValidators.self_bond = item.balance
                }
            })
        }
    }

    private async updateIcons(dbValidators) {
        if (dbValidators.description && dbValidators.description.identity) {
            let validatorIconUrl = await this.stakingValidatorHttp.queryValidatorIcon(dbValidators.description.identity)
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
        const signedBlocksWindow = await (this.parametersTaskModel as any).querySignedBlocksWindow()
        const currentHeight = Number(dbValidators.current_height) || 0
        const startHeight = Number(dbValidators.start_height) || 0
        let diffCurrentStart = currentHeight - startHeight + 1
        let missedBlockCount = Number(dbValidators.missed_blocks_counter) || 0
        dbValidators.uptime = 1 - missedBlockCount / Math.min(diffCurrentStart,signedBlocksWindow.cur_value)

    }
}
