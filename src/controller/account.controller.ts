import { Controller, Get, Param, Query } from '@nestjs/common';
import { AccountService } from '../service/account.service';
import { Result } from '../api/ApiResult';
import { ListStruct } from '../api/ApiResult';
import { 
    genesisAccountsReqDto,
} from '../dto/account.dto';
import { 
    accountsListResDto,
    tokenStatsResDto,
    accountTotalResDto
} from '../dto/account.dto';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('Account')
@Controller('')
export class AccountController {
    constructor(private readonly accountService: AccountService) {
    }

    @Get('task/accounts')
    async taskGenesisAccounts(@Query() query: genesisAccountsReqDto): Promise<String> {
        const status = await this.accountService.taskGenesisAccounts(query)
        return status
    }

    @Get('statistics/accounts')
    async getAccountsList(): Promise<Result<accountsListResDto>> {
        const queryAccountsList = await this.accountService.getAccountsList()
        return new Result<accountsListResDto>(queryAccountsList)
    }

    @Get('statistics/token_stats')
    async getTokenStats(): Promise<Result<tokenStatsResDto>> {
        const tokenStats = await this.accountService.getTokenStats()
        return new Result<tokenStatsResDto>(tokenStats)
    }

    @Get('statistics/account_total')
    async getAccountTotal(): Promise<Result<accountTotalResDto>> {
        const accountTotal = await this.accountService.getAccountTotal()
        return new Result<accountTotalResDto>(accountTotal)
    }
}
