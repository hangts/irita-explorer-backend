import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose'
import {StakingValidatorHttp} from "../http/lcd/staking.validator.http";
import {getTimestamp} from "../util/util";
import {moduleSlashing} from "../constant";

@Injectable()
export class ParametersTaskService {
    constructor(@InjectModel('ParametersTask') private parametersTaskModel: Model<any>
        , private readonly stakingValidatorHttp: StakingValidatorHttp) {
        this.doTask = this.doTask.bind(this);
    }

    async doTask(): Promise<any> {
        let parametersData = await this.stakingValidatorHttp.queryParametersFromSlashing(),
            needInsertData: any[] = [];
        let dbParametersData = await (this.parametersTaskModel as any).queryAllParameters()
        for (const parameterKey in parametersData) {
            const dbData = {
                module: moduleSlashing,
                key: parameterKey,
                cur_value: parametersData[parameterKey],
                create_time: '',
                update_time: ''
            }
            await needInsertData.push(dbData)
        }
        if (dbParametersData.length === 0) {
            needInsertData.forEach(item => {
                item.create_time = getTimestamp()
                item.update_time = getTimestamp()
            })
            await (this.parametersTaskModel as any).insertParameters(needInsertData)
        } else {
            await this.handleData(dbParametersData, needInsertData)
        }
    }

    handleData(dbParameters, needInsertData) {
        let dbParametersMap = new Map()
        let needInsertDataMap = new Map()
        dbParameters.forEach(item => {
            dbParametersMap.set(item.key, item)
        })
        needInsertData.forEach(item => {
            needInsertDataMap.set(item.key, item)
        })
        if (needInsertData.size > 0) {
            needInsertData.forEach(item => {
                if (dbParametersMap.has(item.key)) {
                    needInsertDataMap.get(item.key).update_time = getTimestamp()
                } else {
                    needInsertDataMap.get(item.key).create_time = getTimestamp()
                }
            })
        }
        needInsertDataMap.forEach(item => {
            (this.parametersTaskModel as any).updateParameters(item)
        })

    }
}
