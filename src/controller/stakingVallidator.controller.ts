import {Controller, Query, Get, Param} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {ListStruct, Result} from "../api/ApiResult";
import StakingValidatorService from "../service/staking.validator.service";
import {
    ValCommissionRewReqDto,
    CommissionInfoReqDto,
    ValCommissionRewResDto,
    CommissionInfoResDto,
    ValidatorDelegationsReqDto,
    ValidatorDelegationsResDto,
    ValidatorUnBondingDelegationsReqDto,
    ValidatorUnBondingDelegationsResDto,
    allValidatorReqDto,
    stakingValidatorResDto,
    ValidatorDetailAddrReqDto, ValidatorDetailResDtO, AccountAddrReqDto, AccountAddrResDto,
} from "../dto/stakingValidator.dto";

@ApiTags('Staking')
@Controller('staking')
export class StakingValidatorController {
    constructor(private readonly stakingValidatorService: StakingValidatorService) {
    }

    //获取验证人奖励
    @Get('/distribution/validators/:address')
    async getCommissionRewards(@Param() valAddr: ValCommissionRewReqDto): Promise<Result<ValCommissionRewResDto>> {
        const commissionRewData: ValCommissionRewResDto = await this.stakingValidatorService.getCommissionRewardsByVal(valAddr)
        return new Result<ValCommissionRewResDto>(commissionRewData)
    }

    @Get('/commission_info')
    async getAllValCommissionInfo(@Query()q: CommissionInfoReqDto): Promise<Result<ListStruct<CommissionInfoResDto>>> {
        const allValCommissionData: ListStruct<CommissionInfoResDto> = await this.stakingValidatorService.getAllValCommission(q)
        return new Result<ListStruct<CommissionInfoResDto>>(allValCommissionData)
    }

    @Get('/validators/:address/delegations')
    async getValidatorDelegations(@Param()q: ValidatorDelegationsReqDto): Promise<Result<ListStruct<ValidatorDelegationsResDto>>> {
        const validatorDelegations = await this.stakingValidatorService.getValidatorDelegationList(q)
        return new Result<ListStruct<ValidatorDelegationsResDto>>(validatorDelegations)
    }

    @Get('/validators/:address/unbonding-delegations')
    async getValidatorUnBondingDelegations(@Param()q: ValidatorUnBondingDelegationsReqDto): Promise<Result<ListStruct<ValidatorUnBondingDelegationsResDto>>> {
        const validatorUnBondingDelegations = await this.stakingValidatorService.getValidatorUnBondingDelegations(q)
        return new Result<ListStruct<ValidatorUnBondingDelegationsResDto>>(validatorUnBondingDelegations)
    }

    @Get('/validators')
    async getValidators(@Query()q: allValidatorReqDto): Promise<Result<ListStruct<stakingValidatorResDto>>> {
        const queryValidators = await this.stakingValidatorService.getValidatorsByStatus(q)
        return new Result<ListStruct<stakingValidatorResDto>>(queryValidators)
    }

    @Get('/validators/:address')
    async getValidatorDetail(@Param()q: ValidatorDetailAddrReqDto): Promise<Result<ValidatorDetailResDtO>> {
        const queryValidatorDetail = await this.stakingValidatorService.getValidatorDetail(q)
        return new Result<ValidatorDetailResDtO>(queryValidatorDetail)
    }

    @Get('/account/:address')
    async getAddressAccount(@Param()q: AccountAddrReqDto): Promise<Result<AccountAddrResDto>> {
        const addressAccount = await this.stakingValidatorService.getAddressAccount(q)
        return new Result<AccountAddrResDto>(addressAccount)
    }
}
