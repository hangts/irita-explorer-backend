import { Controller, Get, Query, Param } from '@nestjs/common';
import { DistributionService } from "../service/distribution.service"
import { 
  WithdrawAddressReqDto,
  DelegatorRewardsReqDto } from "../dto/distribution.dto"
import { 
  WithdrawAddressResDto,
  DelegatorRewardsResDto } from "../dto/distribution.dto"
import { Result } from "../api/ApiResult"
import { ListStruct } from "../api/ApiResult"
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Distribution')
@Controller('distribution')
export class DistributionController {
    constructor(private readonly distributionService: DistributionService) {}

    @Get("delegators/:delegatorAddr/withdraw_address")
    async queryTxDetailWithServiceName(@Param() query: WithdrawAddressReqDto): Promise<Result<WithdrawAddressResDto>> {
        const data: WithdrawAddressResDto = await this.distributionService.queryWithdrawAddress(query);
        return new Result<WithdrawAddressResDto>(data);
    }

    @Get("delegators/:delegatorAddr/rewards")
    async queryDelegatorRewards(@Param() query: DelegatorRewardsReqDto): Promise<Result<DelegatorRewardsResDto>> {
        const data: DelegatorRewardsResDto = await this.distributionService.queryDelegatorRewards(query);
        return new Result<DelegatorRewardsResDto>(data);
    }
}
