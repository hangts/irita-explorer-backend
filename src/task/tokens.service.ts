import { Injectable } from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {TokensHttp} from "../http/lcd/tokens.http";
import {ITokens} from "../types/schemaTypes/tokens.interface";
import {Model} from "mongoose"
import {moduleStaking} from "../constant";
@Injectable()
export class TokensTaskService {
    constructor(
        @InjectModel('Tokens') private tokensModel: Model<any>,
        @InjectModel('ParametersTask') private parametersTaskModel: Model<any>,

        private  readonly TokensHttp:TokensHttp
    ) {
        this.doTask = this.doTask.bind(this);
    }
    async doTask(): Promise<void> {
        const TokensData = await this.TokensHttp.getTokens()
        const stakingToken = await (this.parametersTaskModel as any).queryStakingToken(moduleStaking)
        let TokensDbMap =new Map()
        if(TokensData && TokensData.length > 0){
            TokensData.forEach( (item:any) => {
                item.is_main_token = false
                TokensDbMap.set(item.min_unit,item)
            })
        }
        if(stakingToken && stakingToken.cur_value) {
            TokensDbMap.get(stakingToken.cur_value).is_main_token = true
        }
        
       this.insertTokens(TokensDbMap)
    }
    private insertTokens(TokensDataMap) {
        if (TokensDataMap && TokensDataMap.size > 0) {
            TokensDataMap.forEach((Tokens:ITokens) => {
                 (this.tokensModel as any).insertTokens(Tokens)
            })
        }
    }
}
