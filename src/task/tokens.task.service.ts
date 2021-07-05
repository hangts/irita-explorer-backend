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
import { Result } from '../api/ApiResult';
import { TokensReqDto } from '../dto/irita.dto';
import md5 from "blueimp-md5"
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

    async uploadTokenInfo(tokenInfo: TokensReqDto):  Promise<Result<any>> {
      const lcdHashKey = md5((tokenInfo.chain.slice(1, 2) + tokenInfo.denom.slice(5, -10) + tokenInfo.chain.slice(2,3)).slice(3, -8))
      if(lcdHashKey === tokenInfo.key){
        return this.doQueryIbcToken(tokenInfo)
      } else {
        return 
      }
    }

    async doQueryIbcToken(tokenInfo: TokensReqDto): Promise<any>{
      try {
        const selTokensData = await this.tokensModel.queryIbcToken(tokenInfo.denom, tokenInfo.chain)
        if(selTokensData.length > 0){
          return selTokensData[0]
        } else {
          const tracesTokensData = await this.TokensHttp.getIbcTraces(tokenInfo.denom.split('/').pop())
          if(tracesTokensData?.denom_trace) {
            const retTokensData = await this.doInsertIbcToken(tracesTokensData, tokenInfo)
            return retTokensData
          } else {
            return 
          }
        }
      } catch (error) {
        return error
      }
    }

    async doInsertIbcToken(tracesTokensData: any, tokenInfo: any): Promise<any> {
      const data = tracesTokensData
      const a = {
        symbol: data.denom_trace.base_denom,
        denom: tokenInfo.denom,
        scale: 0,
        is_main_token: false,
        initial_supply: '',
        max_supply: '',
        mintable: false,
        owner: '',
        name: '',
        icon: '',
        total_supply: '',
        update_block_height: 0,
        src_protocol: 'IBC',
        chain: tokenInfo.chain
      }
      return await this.tokensModel.insertIbcToken(a)
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
            const TokensDbMap = new Map()
            for (const token of TokensData) {
                TokensFromDB.map(item => {
                    if (item.symbol === token.symbol) {
                        token.total_supply = item.total_supply;
                        token.update_block_height = item.update_block_height
                    }
                })
                const data = await this.txModel.queryTxBySymbol(token.symbol, token.update_block_height)
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
