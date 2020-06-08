import { Controller, Get, Param, Query, Res, Req, Post, Body, HttpCode } from '@nestjs/common';
import { INftQueryParams } from '../types/nft.interface';
import { NftService } from '../service/nft.service';
import { CreateNftDto } from '../dto/create.nft.dto';
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
        console.log(q)
        const data: NftDetailResDto = await this.nftService.queryDetail(q);
        return new Result<NftDetailResDto>(data);
    }



}