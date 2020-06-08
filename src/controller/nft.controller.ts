import { Controller, Get, Query } from '@nestjs/common';
import { NftService } from '../service/nft.service';
import { Result } from '../api/ApiResult';
import { ListStruct } from '../api/ApiResult';
import { NftListReqDto, NftListResDto, NftDetailReqDto, NftDetailResDto } from '../dto/nft.dto';


@Controller('nfts')
export class NftController {
    constructor(private readonly nftService: NftService) {
    }

    @Get()
    async queryList(@Query() q: NftListReqDto): Promise<Result<ListStruct<NftListResDto[]>>> {
        const data: ListStruct<NftListResDto[]> = await this.nftService.queryList(q);
        return new Result<ListStruct<NftListResDto[]>>(data);
    }

    @Get('details')
    async queryDetail(@Query() q: NftDetailReqDto): Promise<Result<NftDetailResDto>> {
        const data: NftDetailResDto = await this.nftService.queryDetail(q);
        return new Result<NftDetailResDto>(data);
    }



}