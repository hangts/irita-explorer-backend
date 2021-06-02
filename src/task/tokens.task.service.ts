import { map } from 'rxjs/operators';
import { Injectable } from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {TokensHttp} from "../http/lcd/tokens.http";
import {ITokens} from "../types/schemaTypes/tokens.interface";
import {Model} from "mongoose"
import { moduleStaking } from "../constant";
import { TxType,currentChain, SRC_PROTOCOL } from '../constant';
import { cfg } from '../config/config'
import {TokensLcdDto} from "../dto/http.dto";
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
        let TokensData;
        switch (cfg.currentChain) {
            case currentChain.iris:
                // iris
                TokensData = await this.TokensHttp.getTokens()
                break;
                //cosmos token暂时只应手动插入
            /*case currentChain.cosmos:
                // cosmos
                TokensData = TokensLcdDto.bundleData([cfg.MAIN_TOKEN])
                break;*/
            default:
                break;
        }

        if (TokensData && TokensData.length > 0) {
            const TokensFromDB = await (this.tokensModel as any).queryAllTokens()
            const stakingToken = await (this.parametersTaskModel as any).queryStakingToken(moduleStaking)
            let TokensDbMap = new Map()
            for (let token of TokensData) {
                TokensFromDB.map(item => {
                    if (item.symbol === token.symbol) {
                        token.total_supply = item.total_supply;
                        token.update_block_height = item.update_block_height
                    }
                })
                let data = await this.txModel.queryTxBySymbol(token.symbol, token.update_block_height)
                if (data && data.length) {
                    data.forEach(item => {
                        token.update_block_height = item.height
                        item.msgs.forEach(element => {
                            if (element.type === TxType.mint_token) {
                                //TODO:duanjie 使用大数计算
                                token.total_supply = String(Number(token.total_supply) + Number(element.msg.amount))
                            } else if (element.type === TxType.burn_token) {
                                //TODO:duanjie 使用大数计算
                                token.total_supply = String(Number(token.total_supply) - Number(element.msg.amount))
                            }
                        })
                    })
                }
                token.src_protocol = SRC_PROTOCOL.NATIVE;
                token.chain = cfg.currentChain;
                TokensDbMap.set(token.denom,token)
            }
            if(stakingToken && stakingToken.cur_value) {
                TokensDbMap.get(stakingToken.cur_value).is_main_token = true
            }

            this.insertTokens(TokensDbMap)
        }

    }
    private insertTokens(TokensDataMap) {
        if (TokensDataMap && TokensDataMap.size > 0) {
            TokensDataMap.forEach((Tokens:ITokens) => {
                 (this.tokensModel as any).insertTokens(Tokens)
            })
        }
    }
}
