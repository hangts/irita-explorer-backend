import { Injectable } from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {TokensHttp} from "../http/lcd/tokens.http";
import {Model} from "mongoose"
import { Result } from '../api/ApiResult';
import { TokensReqDto, TokensResDto } from '../dto/irita.dto';
import { BaseResDto } from '../dto/base.dto'
import { SRC_PROTOCOL } from '../constant'
import md5 from "blueimp-md5"

@Injectable()
export class TokenService {
    constructor(
        @InjectModel('Tokens') private tokensModel: Model<any>,
        private readonly TokensHttp:TokensHttp
    ) {}

    async uploadTokenInfo(tokenInfo: TokensReqDto): Promise<Result<any>> {
      const lcdHashKey = md5((tokenInfo.chain.slice(1, 2) + tokenInfo.denom.slice(5, -10) + tokenInfo.chain.slice(2,3)).slice(3, -8))
      if(lcdHashKey === tokenInfo.key){
        return this.doQueryIbcToken(tokenInfo)
      } else {
        return BaseResDto.bundleData('validate error')
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
            const result = TokensResDto.bundleData(retTokensData)
            return result
          } else {
            return BaseResDto.bundleData('') 
          }
        }
      } catch (error) {
        return BaseResDto.bundleData('queryIbcToken error')
      }
    }

    async doInsertIbcToken(tracesTokensData: any, tokenInfo: any): Promise<any> {
      const data = tracesTokensData
      const Itoken = {
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
        src_protocol: SRC_PROTOCOL.IBC,
        chain: tokenInfo.chain
      }
      return await this.tokensModel.insertIbcToken(Itoken)
    }
}
