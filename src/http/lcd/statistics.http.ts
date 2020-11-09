import { HttpService, Injectable } from '@nestjs/common';
import {cfg} from "../../config/config";
import {BondedTokensLcdDto,TotalSupplyLcdDto} from "../../dto/http.dto";
import {Logger} from "../../logger";
@Injectable()
export class StatisticsHttp {
    static async getBondedTokens () {
        const BondedTokensUrl = `${cfg.serverCfg.lcdAddr}/staking/pool`
        try {
            let BondedTokens: any = await new HttpService().get(BondedTokensUrl).toPromise().then(result => result.data)
            if (BondedTokens && BondedTokens.result) {
                return new BondedTokensLcdDto(BondedTokens.result);
            } else {
                Logger.warn('api-error:', 'there is no result of bonded_tokens from lcd');
            }
        } catch (e) {
            Logger.warn(`api-error from ${BondedTokensUrl}`, e)
        }
    }
    static async getTotalSupply () {
        const TotalSupplyUrl = `${cfg.serverCfg.lcdAddr}/cosmos/bank/v1beta1/supply`
        try {
            let totalSupplyData: any = await new HttpService().get(TotalSupplyUrl).toPromise().then(result => result.data)
            if (totalSupplyData) {
                return new TotalSupplyLcdDto(totalSupplyData);
            } else {
                Logger.warn('api-error:', 'there is no result of total_supply from lcd');
            }
        } catch (e) {
            Logger.warn(`api-error from ${TotalSupplyUrl}`, e)
        }

    }
}
