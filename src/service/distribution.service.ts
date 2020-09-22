import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DistributionHttp } from '../http/lcd/distribution.http';
// import { ListStruct, Result } from '../api/ApiResult';
import { 
  WithdrawAddressReqDto,
  DelegatorRewardsReqDto } from "../dto/distribution.dto"
import { 
  WithdrawAddressResDto,
  DelegatorRewardsResDto } from "../dto/distribution.dto"

@Injectable()
export class DistributionService {
    constructor(@InjectModel('StakingValidator') private stakingValidator: any) {

    }

    async queryWithdrawAddress(query: WithdrawAddressReqDto): Promise<WithdrawAddressResDto | null> {
        const { delegatorAddr } = query;
        let data = await DistributionHttp.queryWithdrawAddressByDelegator(delegatorAddr);
        if (data) {
          return new WithdrawAddressResDto(data.address);
        }else{
          return null;
        }
    }

    async queryDelegatorRewards(query: DelegatorRewardsReqDto): Promise<DelegatorRewardsResDto | null> {
        const { delegatorAddr } = query;
        let data = await DistributionHttp.queryDelegatorRewards(delegatorAddr);
        if (data && data.rewards && data.rewards.length) {
          let validators = await this.stakingValidator.queryAllValidators();
          if (validators.length) {
            let validatorMap = {};
            validators.forEach((v)=>{
              validatorMap[v.operator_address] = v;
            });
            data.rewards.forEach((item)=>{
              let v = validatorMap[item.validator_address];
              if (v) {
                (item as any).moniker = (v.description || {}).moniker || '';
              }
            })
          }
          return new DelegatorRewardsResDto(data);
        }else{
          return null;
        }
    }
}
