import { HttpService, Injectable } from '@nestjs/common';
import {cfg} from "../../config/config";
import {TokenScaleLcdDto,TokenScaleStakingLcdToken} from "../../dto/http.dto";
import {Logger} from "../../logger";
@Injectable()
export class TokenScaleHttp {
    async getTokenScale () {
        const tokenScaleUrl = `${cfg.serverCfg.lcdAddr}/irismod/token/tokens`
        try {
            let tokenScaleData: any = await new HttpService().get(tokenScaleUrl).toPromise().then(result => result.data)
            if (tokenScaleData && tokenScaleData.Tokens) {
                return TokenScaleLcdDto.bundleData(tokenScaleData.Tokens);
            } else {
                Logger.warn('api-error:', 'there is no result of validators from lcd');
            }
        } catch (e) {
            Logger.warn(`api-error from ${tokenScaleUrl}`, e)
        }
    }
    async getStakingTokenScale() {
        const stakingTokenScaleUrl = `${cfg.serverCfg.lcdAddr}/cosmos/staking/v1beta1/params`
        try {
            let stakingTokenScaleData: any = await new HttpService().get(stakingTokenScaleUrl).toPromise().then(result => result.data)
            if (stakingTokenScaleData && stakingTokenScaleData.params) {
                return new TokenScaleStakingLcdToken(stakingTokenScaleData.params);
            } else {
                Logger.warn('api-error:', 'there is no result of validators from lcd');
            }
        } catch (e) {
            Logger.warn(`api-error from ${stakingTokenScaleUrl}`, e)
        }

    }
}
