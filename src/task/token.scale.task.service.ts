import { Injectable } from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {TokenScaleHttp} from "../http/lcd/token.scale.http";
import {ITokenScale} from "../types/schemaTypes/token.scale.interface";
import {Model} from "mongoose"
import {moduleStaking} from "../constant";
@Injectable()
export class TokenScaleTaskService {
    constructor(
        @InjectModel('TokenScale') private tokenScaleModel: Model<any>,
        @InjectModel('ParametersTask') private parametersTaskModel: Model<any>,

        private  readonly tokenScaleHttp:TokenScaleHttp
    ) {
        this.doTask = this.doTask.bind(this);
    }
    async doTask(): Promise<void> {
        const tokenScaleData = await this.tokenScaleHttp.getTokenScale()
        const stakingToken = await (this.parametersTaskModel as any).queryStakingToken(moduleStaking)
        let tokenScaleDbMap =new Map()
        if(tokenScaleData && tokenScaleData.length > 0){
            tokenScaleData.forEach( (item:any) => {
                item.is_main_token = false
                tokenScaleDbMap.set(item.min_unit,item)
            })
        }
        if(stakingToken && stakingToken.cur_value) {
            tokenScaleDbMap.get(stakingToken.cur_value).is_main_token = true
        }
       this.insertTokenScale(tokenScaleDbMap)
    }
    private insertTokenScale(tokenScaleDataMap) {
        if (tokenScaleDataMap && tokenScaleDataMap.size > 0) {
            tokenScaleDataMap.forEach((tokenScale:ITokenScale) => {
                 (this.tokenScaleModel as any).insertTokenScale(tokenScale)
            })
        }
    }
}
