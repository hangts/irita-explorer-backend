import { Injectable } from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {TokensHttp} from "../http/lcd/tokens.http";
import {ITokens} from "../types/schemaTypes/tokens.interface";
import {Model} from "mongoose"
import { moduleStaking } from "../constant";
import { TxType } from '../constant';
@Injectable()
export class TokensTaskService {
    constructor(
        @InjectModel('Tokens') private tokensModel: Model<any>,
        @InjectModel('ParametersTask') private parametersTaskModel: Model<any>,
        @InjectModel('Tx') private txModel: any,

        private  readonly TokensHttp:TokensHttp
    ) {
        this.doTask = this.doTask.bind(this);
    }
    async doTask(): Promise<void> {
        const TokensData = await this.TokensHttp.getTokens()
        const stakingToken = await (this.parametersTaskModel as any).queryStakingToken(moduleStaking)
        let TokensDbMap =new Map()
        if (TokensData && TokensData.length > 0) {
            for (let token of TokensData) {
                let data = await this.txModel.queryTxBySymbol(token.symbol, token.latest_height)
                if (data && data.length) {
                    data.forEach(item => {
                        token.latest_height = item.height
                        item.msgs.forEach(element => {
                            if (element.type === TxType.mint_token) {
                                token.total_supply = String(Number(token.total_supply) + Number(element.msg.amount))
                            }
                        })
                    })
                }
                TokensDbMap.set(token.min_unit,token)
            }
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
