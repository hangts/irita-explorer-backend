import {Controller, Get, Query, Param, UseInterceptors} from '@nestjs/common';
import { DistributionService } from "../service/distribution.service"
import { 
  WithdrawAddressReqDto,
  DelegatorRewardsReqDto,
  ValCommissionRewReqDto } from "../dto/distribution.dto"
import { 
  WithdrawAddressResDto,
  DelegatorRewardsResDto,
  ValCommissionRewResDto } from "../dto/distribution.dto"
import {DomainResult, Result} from "../api/ApiResult"
import { ListStruct } from "../api/ApiResult"
import { ApiTags } from '@nestjs/swagger';
import {ResponseInterceptor} from "../interceptor/response.interceptor";

@ApiTags('Distribution')
@Controller('distribution')
export class DistributionController {
    constructor(private readonly distributionService: DistributionService) {}

    @Get("delegators/:delegatorAddr/withdraw_address")
    @UseInterceptors(ResponseInterceptor)
    async queryDelegatorWithdrawAddress(@Param() query: WithdrawAddressReqDto): Promise<Result<DomainResult<any>>> {
        const data: WithdrawAddressResDto = await this.distributionService.queryWithdrawAddress(query);
        return new Result(new DomainResult(data));

    }

    @Get("delegators/:delegatorAddr/rewards")
    async queryDelegatorRewards(@Param() query: DelegatorRewardsReqDto): Promise<Result<DelegatorRewardsResDto>> {
        const data: DelegatorRewardsResDto = await this.distributionService.queryDelegatorRewards(query);
        return new Result<DelegatorRewardsResDto>(data);
    }

    //获取验证人奖励
    @Get('/validators/:address')
    async getCommissionRewards(@Param() query: ValCommissionRewReqDto): Promise<Result<ValCommissionRewResDto>> {
        const commissionRewData: ValCommissionRewResDto = await this.distributionService.getCommissionRewardsByVal(query)
        return new Result<ValCommissionRewResDto>(commissionRewData)
    }
}
