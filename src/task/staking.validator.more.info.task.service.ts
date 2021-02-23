import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {StakingHttp} from "../http/lcd/staking.http";
import {Model} from "mongoose"
import {addressTransform} from "../util/util";
import { addressPrefix } from "../constant";

@Injectable()
export class StakingValidatorMoreInfoTaskService {
    constructor(@InjectModel('StakingSyncValidators') private stakingSyncValidatorsModel: Model<any>,
                private readonly stakingHttp: StakingHttp) {
        this.doTask = this.doTask.bind(this);
    }

    async doTask(): Promise<void> {
        let validatorsFromDb = await (this.stakingSyncValidatorsModel as any).queryAllValidators();
        // 处理数据
        if (validatorsFromDb && Array.isArray(validatorsFromDb) && validatorsFromDb.length > 0) {
            await this.handDbValidators(validatorsFromDb)
        }
        await this.UpdateValidators(validatorsFromDb)
    }

    private async handDbValidators(validatorsFromDb) {
        for (let i = 0; i < validatorsFromDb.length; i++) {
            await Promise.all([this.updateSelfBond(validatorsFromDb[i]),this.updateIcons(validatorsFromDb[i])])
        }
    }

    private async updateSelfBond(dbValidators) {
        if (dbValidators.operator_address) {
            let valTranDelAddr = addressTransform(dbValidators.operator_address, addressPrefix.iaa)
            let selfBondData = await this.stakingHttp.queryValidatorDelegationsFromLcd(dbValidators.operator_address)
            dbValidators.delegator_num = selfBondData.length;
            selfBondData.forEach((item) => {
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
            let validatorIconUrl:any = await this.stakingHttp.queryValidatorIcon(dbValidators.description.identity)
            if (validatorIconUrl.them
                && validatorIconUrl.them.length
                && validatorIconUrl.them[0].pictures
                && validatorIconUrl.them[0].pictures.primary
                && validatorIconUrl.them[0].pictures.primary.url) {
                dbValidators.icon = validatorIconUrl.them[0].pictures.primary.url
            }
        }
    }

    private UpdateValidators(validatorsFromDb) {
        if (validatorsFromDb && validatorsFromDb.length > 0) {
            validatorsFromDb.forEach(async (validator) => {
                await (this.stakingSyncValidatorsModel as any).insertValidator(validator)
            })
        }
    }
}