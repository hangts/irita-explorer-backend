import { Controller, Get, Query } from '@nestjs/common';
import { DenomService } from '../service/denom.service';
import { Result } from '../api/ApiResult';
import { ListStruct } from '../api/ApiResult';
import { DenomListReqDto, DenomListResDto } from '../dto/denom.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Denoms')
@Controller('denoms')
export class DenomController {
    constructor(private readonly denomService: DenomService) {
    }

    @Get()
    async queryDenomTxList(@Query() q: DenomListReqDto): Promise<Result<ListStruct<DenomListResDto[]>>> {
        try {
            const data: ListStruct<DenomListResDto[]> = await this.denomService.queryList(q);
            return new Result<ListStruct<DenomListResDto[]>>(data);
        } catch (e) {
            console.error(e);
        }

    }


}