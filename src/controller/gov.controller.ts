import { Controller, Get, Param, Query } from '@nestjs/common';
import { GovService } from '../service/gov.service';
import { Result } from '../api/ApiResult';
import { ListStruct } from '../api/ApiResult';
import { 
    proposalsReqDto
} from '../dto/gov.dto';
import { 
    govProposalResDto
} from '../dto/gov.dto';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('Gov')
@Controller('gov')
export class GovController {
    constructor(private readonly govService: GovService) {
    }

    @Get('proposals')
    async getProposals(@Query()q: proposalsReqDto): Promise<Result<ListStruct<govProposalResDto>>> {
        const queryProposals = await this.govService.getProposals(q)
        return new Result<ListStruct<govProposalResDto>>(queryProposals)
    }
}
