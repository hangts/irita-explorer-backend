import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose'
import {StakingValidatorHttp} from "../http/lcd/staking.validator.http";
import {getTimestamp} from "../util/util";
@Injectable()
export class ParametersTaskService {
    constructor(@InjectModel('ParametersTask') private parametersTaskModel: Model<any>
                ,private readonly stakingValidatorHttp: StakingValidatorHttp) {
        this.doTask = this.doTask.bind(this);
    }
    async doTask(): Promise<void> {
        let parametersData = await this.stakingValidatorHttp.queryParametersFromSlashing(),
            needInsertData = [];
        let dbParametersData = await (this.parametersTaskModel as any).queryAllParameters()
        for (const parameterKey in parametersData) {
            const dbData = {
                module:'slashing',
                key: parameterKey,
                cur_value: parametersData[parameterKey],
                create_time:getTimestamp(),
                update_time:''
            }
            needInsertData.push(dbData)
        }
        if(dbParametersData.length === 0){
            (this.parametersTaskModel as any).insertParameters(needInsertData)
        }else {
            this.handleData(dbParametersData,needInsertData)
        }
    }

    handleData(dbParameters,needInsertData){
        if(needInsertData.keys().length > 0){
            dbParameters.forEach( item => {
                if(item.cur_value !== needInsertData[item.key]){
                    needInsertData[item.key].update_time = getTimestamp()
                }
            })
            needInsertData.forEach( item => {
                (this.parametersTaskModel as any).updateParameters(needInsertData)
            })
        }
    }
}
