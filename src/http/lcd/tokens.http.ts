import { HttpService, Injectable } from '@nestjs/common';
import {cfg} from "../../config/config";
import {TokensLcdDto,TokensStakingLcdToken} from "../../dto/http.dto";
import {Logger} from "../../logger";
@Injectable()
export class TokensHttp {
    async getTokens () {
        const TokensUrl = `${cfg.serverCfg.lcdAddr}/irismod/token/tokens`
        try {
            let TokensData: any = await new HttpService().get(TokensUrl).toPromise().then(result => result.data)
            if (TokensData && TokensData.Tokens) {
                return TokensLcdDto.bundleData(TokensData.Tokens);
            } else {
                Logger.warn('api-error:', 'there is no result of validators from lcd');
            }
        } catch (e) {
            Logger.warn(`api-error from ${TokensUrl}`, e)
        }
    }
    async getStakingTokens() {
        const stakingTokensUrl = `${cfg.serverCfg.lcdAddr}/cosmos/staking/v1beta1/params`
        try {
            let stakingTokensData: any = await new HttpService().get(stakingTokensUrl).toPromise().then(result => result.data)
            if (stakingTokensData && stakingTokensData.params) {
                return new TokensStakingLcdToken(stakingTokensData.params);
            } else {
                Logger.warn('api-error:', 'there is no result of validators from lcd');
            }
        } catch (e) {
            Logger.warn(`api-error from ${stakingTokensUrl}`, e)
        }

    }
}
