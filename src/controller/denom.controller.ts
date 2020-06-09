import { Controller, Get } from '@nestjs/common';
import { DenomService } from '../service/denom.service';
import { Result } from '../api/ApiResult';
import { ListStruct } from '../api/ApiResult';
import { DenomListResDto } from '../dto/denom.dto';


@Controller('denoms')
export class DenomController {
    constructor(private readonly denomService: DenomService) {
    }

    @Get()
    async queryList(): Promise<Result<ListStruct<DenomListResDto[]>>> {
        const data: ListStruct<DenomListResDto[]> = await this.denomService.queryList();
        return new Result<ListStruct<DenomListResDto[]>>(data);
    }


}