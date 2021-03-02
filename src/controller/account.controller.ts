import { Controller, Get, Param, Query } from '@nestjs/common';
import { AccountService } from '../service/account.service';
import { Result } from '../api/ApiResult';
import { ListStruct } from '../api/ApiResult';
import { 
    genesisAccountsReqDto
} from '../dto/account.dto';
import { 

} from '../dto/account.dto';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('Account')
@Controller('account')
export class AccountController {
    constructor(private readonly accountService: AccountService) {
    }

    @Get('task/accounts')
    async taskGenesisAccounts(@Query() query: genesisAccountsReqDto): Promise<String> {
        const status = await this.accountService.taskGenesisAccounts(query)
        return status
    }

    // @Get('proposals/:id')
    // async getProposalDetail(@Param() param: ProposalDetailReqDto): Promise<Result<govProposalDetailResDto>> {
    //     const queryProposalDetail = await this.govService.getProposalDetail(param)
    //     return new Result<govProposalDetailResDto>(queryProposalDetail)
    // }

    // @Get('proposals/:id/voter')
    // async getProposalVoter(@Param() param: ProposalDetailReqDto,@Query() query: proposalsVoterReqDto): Promise<Result<ListStruct<govProposalVoterResDto>>> {
    //     const queryProposalsVoter = await this.govService.getProposalsVoter(param,query)
    //     return new Result<ListStruct<govProposalVoterResDto>>(queryProposalsVoter)
    // }

    // @Get('proposals/:id/depositor')
    // async getProposalDepositor(@Param() param: ProposalDetailReqDto,@Query() query: proposalsReqDto): Promise<Result<ListStruct<govProposalDepositorResDto>>> {
    //     const queryProposalsDepositor = await this.govService.getProposalsDepositor(param,query)
    //     return new Result<ListStruct<govProposalDepositorResDto>>(queryProposalsDepositor)
    // }

}
