import { Injectable } from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {TokensHttp} from "../http/lcd/tokens.http";
import {Model} from "mongoose"
import { Result } from '../api/ApiResult';
import { TokensReqDto, TokensResDto, } from '../dto/irita.dto';
import { IbcTraceDto } from '../dto/http.dto';
import { BaseResDto } from '../dto/base.dto'
import { SRC_PROTOCOL } from '../constant'
import md5 from "blueimp-md5"
import { ApiError } from '../api/ApiResult';
import { ErrorCodes } from '../api/ResultCodes';
import { cfg } from '../config/config'

@Injectable()
export class TokenService {
    constructor(
        @InjectModel('Tokens') private tokensModel: Model<any>,
        private readonly TokensHttp:TokensHttp
    ) {}

    async uploadTokenInfo(tokenInfo: TokensReqDto): Promise<TokensResDto | null> {
      const lcdHashKey = md5(tokenInfo.denom.slice(5, -10).slice(3, -8))
      if(lcdHashKey === tokenInfo.key){
        return this.doQueryIbcToken(tokenInfo)
      } else {
        throw new ApiError(ErrorCodes.InvalidRequest,"key validate error")
      }
    }

    async doQueryIbcToken(tokenInfo: TokensReqDto): Promise<TokensResDto | null>{
      try {
        const selTokensData = await (this.tokensModel as any).queryIbcToken(tokenInfo.denom, tokenInfo.chain || cfg.currentChain)
        if(selTokensData.length > 0){
          return new TokensResDto(selTokensData[0])
        } else {
          const ibcTest = /ibc\/[0-9A-Z]{54}/
          if(ibcTest.test(tokenInfo.denom)){
            const tracesTokensData = await this.TokensHttp.getIbcTraces(tokenInfo.denom.split('/').pop())
            if(tracesTokensData?.denom_trace) {
              const { result } = await this.doInsertIbcToken(tracesTokensData, tokenInfo)
              if(result?.ok === 1){
                const queryRet = await (this.tokensModel as any).queryIbcToken(tokenInfo.denom, tokenInfo.chain || cfg.currentChain)
                return new TokensResDto(queryRet[0])  
              } else {
                throw new ApiError(ErrorCodes.failed, "query IbcToken failed")
              } 
            } else {
              throw new ApiError(ErrorCodes.failed, "get IbcTraces failed")
            }
          } else {
            throw new ApiError(ErrorCodes.InvalidParameter, "denom pattern should be 'ibc/XXX'")
          }    
        }
      } catch (error) {
        throw new ApiError(ErrorCodes.failed, "query IbcToken error")
      }
    }

    async doInsertIbcToken(tracesTokensData: IbcTraceDto, tokenInfo: TokensReqDto): Promise<any> {
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
        total_supply: '',
        update_block_height: 0,
        src_protocol: SRC_PROTOCOL.IBC,
        chain: tokenInfo.chain || cfg.currentChain,
        is_authed: false,
      }
      return await (this.tokensModel as any).insertIbcToken(Itoken)
    }
}
