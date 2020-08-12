import { Controller, Get , Query} from '@nestjs/common';
import { DenomService } from '../service/denom.service';
import { Result } from '../api/ApiResult';
import { ListStruct } from '../api/ApiResult';
import { DenomTxListReqDto, DenomListResDto, DenomTxListResDto } from '../dto/denom.dto';
import { ApiTags} from '@nestjs/swagger';
import { NftDetailReqDto } from '../dto/nft.dto';

@ApiTags('Denoms')
@Controller('denoms')
export class DenomController {
    constructor(private readonly denomService: DenomService) {
    }

    @Get('type')
    async queryList(): Promise<Result<ListStruct<DenomListResDto[]>>> {
        const data: ListStruct<DenomListResDto[]> = await this.denomService.queryList();
        return new Result<ListStruct<DenomListResDto[]>>(data);
    }

     @Get()
    async queryDenomTxList(@Query() q: DenomTxListReqDto): Promise<Result<ListStruct<DenomTxListResDto[]>>> {
        try {
            const data: ListStruct<DenomTxListResDto[]> = await this.denomService.queryTxList(q);
            return new Result<ListStruct<DenomTxListResDto[]>>(data);
        }catch (e) {
            console.error(e)
        }

    }






}