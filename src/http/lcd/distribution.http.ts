import { HttpService, Injectable } from '@nestjs/common';
import { cfg } from '../../config/config';
import { Logger } from '../../logger';
import { WithdrawAddressDto , DelegatorRewardsDto } from '../../dto/http.dto';

@Injectable()
export class DistributionHttp {
    constructor(){

    }
    static async queryWithdrawAddressByDelegator(delegatorAddr: string): Promise<WithdrawAddressDto> {
        const url: string = `${cfg.serverCfg.lcdAddr}/distribution/delegators/${delegatorAddr}/withdraw_address`;
        try {
            const data: any = await new HttpService().get(url).toPromise().then(res => res.data);
            if(data && data.result){
                return new WithdrawAddressDto(data.result);
            }else{
                Logger.warn('api-error:', 'there is no result of nft from lcd');
            }

        } catch (e) {
            Logger.warn(`api-error from ${url}:`, e.message);
            // cron jobs error should not throw errors;
        }
    }

    static async queryDelegatorRewards(delegatorAddr: string): Promise<DelegatorRewardsDto> {
        const url: string = `${cfg.serverCfg.lcdAddr}/distribution/delegators/${delegatorAddr}/rewards`;
        try {
            const data: any = await new HttpService().get(url).toPromise().then(res => res.data);
            if(data && data.result){
                return new DelegatorRewardsDto(data.result);
            }else{
                Logger.warn('api-error:', 'there is no result of nft from lcd');
            }

        } catch (e) {
            Logger.warn(`api-error from ${url}:`, e.message);
            // cron jobs error should not throw errors;
        }
    }
}