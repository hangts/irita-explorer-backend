import { HttpService, Injectable } from '@nestjs/common';
import { cfg } from '../../config/config';
import { Logger } from '../../logger';
import {
    WithdrawAddressDto,
    DelegatorRewardsDto,
    commissionRewardsLcdDto,
    communityPoolLcdDto, DistributeParamsLcdDto
} from '../../dto/http.dto';

@Injectable()
export class DistributionHttp {
    constructor(){

    }
    static async queryWithdrawAddressByDelegator(delegatorAddr: string): Promise<WithdrawAddressDto> {
        const url: string = `${cfg.serverCfg.lcdAddr}/cosmos/distribution/v1beta1/delegators/${delegatorAddr}/withdraw_address`;
        try {
            const data: any = await new HttpService().get(url).toPromise().then(res => res.data);
            if(data && data.withdraw_address){
                return new WithdrawAddressDto(data.withdraw_address);
            }else{
                Logger.warn('api-error:', 'there is no result of nft from lcd');
            }

        } catch (e) {
            Logger.warn(`api-error from ${url}:`, e.message);
            // cron jobs error should not throw errors;
        }
    }

    static async queryDelegatorRewards(delegatorAddr: string): Promise<DelegatorRewardsDto> {
        const url: string = `${cfg.serverCfg.lcdAddr}/cosmos/distribution/v1beta1/delegators/${delegatorAddr}/rewards`;
        try {
            const data: any = await new HttpService().get(url).toPromise().then(res => res.data);
            if (data) {
                return new DelegatorRewardsDto(data);
            }else{
                Logger.warn('api-error:', 'there is no result of nft from lcd');
            }
        } catch (e) {
            Logger.warn(`api-error from ${url}:`, e.message);
            // cron jobs error should not throw errors;
        }
    }

    static async getCommissionRewards(valAddress:string): Promise<commissionRewardsLcdDto> {
        const getCommissionRewardsUri = `${cfg.serverCfg.lcdAddr}/cosmos/distribution/v1beta1/validators/${valAddress}/commission`
        try {
            const commissionRewardsData: any = await new HttpService().get(getCommissionRewardsUri).toPromise().then(result => result.data)
            if (commissionRewardsData) {
                return new commissionRewardsLcdDto(commissionRewardsData)
                
            } else {
                Logger.warn('api-error:', 'there is no result of validator withdraw address from lcd');
            }

        } catch (e) {
            Logger.warn(`api-error from ${getCommissionRewardsUri}`, e)
        }
    }

    static async getCommunityPool(): Promise<communityPoolLcdDto> {
        const getCommunityPoolUri = `${cfg.serverCfg.lcdAddr}/cosmos/distribution/v1beta1/community_pool`
        try {
            const communityPoolData: any = await new HttpService().get(getCommunityPoolUri).toPromise().then(result => result.data)
            if (communityPoolData && communityPoolData.pool) {
                return new communityPoolLcdDto(communityPoolData)
            } else {
                Logger.warn('api-error:', 'there is no result of community_pool from lcd');
            }
        } catch (e) {
            Logger.warn(`api-error from ${getCommunityPoolUri}`, e)
        }
    }

    async getDistributionParams() {
        const url = `${cfg.serverCfg.lcdAddr}/cosmos/distribution/v1beta1/params`
        try {
            const paramData: any = await new HttpService().get(url).toPromise().then(result => result.data)
            if (paramData) {
                return new DistributeParamsLcdDto(paramData.params)
            } else {
                Logger.warn('api-error:', 'there is no result of distribution params from lcd');
            }
        } catch (e) {
            Logger.warn(`api-error from ${url}`, e)
        }
    }
}