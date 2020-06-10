import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { NftService } from '../service/nft.service';
import { Result } from '../api/ApiResult';
import { ListStruct } from '../api/ApiResult';
import { NftListReqDto, NftListResDto, NftDetailReqDto, NftDetailResDto } from '../dto/nft.dto';
import ValidationPipe from '../pipe/validation.pipe';
import { ApiTags} from '@nestjs/swagger';

@ApiTags('Nfts')
@Controller('nfts')
export class NftController {
    constructor(private readonly nftService: NftService) {
    }

    @Get()
    @UsePipes(new ValidationPipe())
    async queryList(@Query() q: NftListReqDto): Promise<Result<ListStruct<NftListResDto[]>>> {
        const data: ListStruct<NftListResDto[]> = await this.nftService.queryList(q);
        return new Result<ListStruct<NftListResDto[]>>(data);
    }

    @Get('details')
    @UsePipes(new ValidationPipe())
    async queryDetail(@Query() q: NftDetailReqDto): Promise<Result<NftDetailResDto | null>> {
        const data: NftDetailResDto = await this.nftService.queryDetail(q);
        return new Result<NftDetailResDto | null>(data);
    }



}