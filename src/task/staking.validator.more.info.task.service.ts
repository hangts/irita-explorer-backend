import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {StakingHttp} from "../http/lcd/staking.http";
import {Model} from "mongoose"
import {addressTransform} from "../util/util";
import {addressPrefix, TaskEnum} from "../constant";
import {CronTaskWorkingStatusMetric} from "../monitor/metrics/cron_task_working_status.metric";

@Injectable()
export class StakingValidatorMoreInfoTaskService {
    constructor(@InjectModel('StakingSyncValidators') private stakingSyncValidatorsModel: Model<any>,
                private readonly cronTaskWorkingStatusMetric: CronTaskWorkingStatusMetric,
                private readonly stakingHttp: StakingHttp) {
        this.doTask = this.doTask.bind(this);
        this.cronTaskWorkingStatusMetric.collect(TaskEnum.stakingSyncValidatorsMoreInfo,0)
    }

    async doTask(): Promise<void> {
        let validatorsFromDb = await (this.stakingSyncValidatorsModel as any).queryAllValidators();
        // 处理数据
        if (validatorsFromDb && Array.isArray(validatorsFromDb) && validatorsFromDb.length > 0) {
            await this.handDbValidators(validatorsFromDb)
        }
        // await this.UpdateValidators(validatorsFromDb)
    }

    private async handDbValidators(validatorsFromDb) {
        for (let i = 0; i < validatorsFromDb.length; i++) {
            await Promise.all([this.updateSelfBond(validatorsFromDb[i]),this.updateIcons(validatorsFromDb[i])])
            await (this.stakingSyncValidatorsModel as any).insertValidator(validatorsFromDb[i])
        }
    }

    private async updateSelfBond(dbValidators) {
        if (dbValidators.operator_address) {
            let valTranDelAddr = addressTransform(dbValidators.operator_address, addressPrefix.iaa);
            // let [selfBondData, delegatorNum] = await Promise.all([this.stakingHttp.queryValidatorSelfBondFromLcd(dbValidators.operator_address, valTranDelAddr), this.stakingHttp.queryValidatordelegatorNumFromLcd(dbValidators.operator_address)]);
            // dbValidators.delegator_num = delegatorNum;
            let selfBondData:any = await this.stakingHttp.queryValidatorSelfBondFromLcd(dbValidators.operator_address, valTranDelAddr);
            dbValidators.self_bond = (selfBondData && selfBondData.balance) || {};
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

    // private UpdateValidators(validatorsFromDb) {
    //     if (validatorsFromDb && validatorsFromDb.length > 0) {
    //         validatorsFromDb.forEach(async (validator) => {
    //             await (this.stakingSyncValidatorsModel as any).insertValidator(validator)
    //         })
    //     }
    // }
}
