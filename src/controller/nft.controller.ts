import { Controller, Get, Param, Query, Res, Req, Post, Body, HttpCode } from '@nestjs/common';
import { INftQueryParams } from '../types/nft.interface';
import { NftService } from '../service/nft.service';
import { CreateNftDto } from '../dto/create.nft.dto';
import { Result } from '../api/ApiResult';
import { ListStruct } from '../api/ApiResult';


@Controller('nfts')
export class NftController {
    constructor(private readonly nftService: NftService) {
    }

    @Get()
    async queryList(@Query() q: INftQueryParams): Promise<Result<ListStruct<any>>> {
        const data: ListStruct<any> = await this.nftService.queryList(q);
        return new Result<any>(data);
    }

    @Post('create')
    async createOne(@Body() createNftDto: CreateNftDto): Promise<Result<CreateNftDto>> {
        const res: CreateNftDto = await this.nftService.createOne(createNftDto);
        return  new Result<any>(res);
    }
}