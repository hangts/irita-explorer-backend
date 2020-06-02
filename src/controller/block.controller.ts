import { Controller, Get, Param, Query, Res, Req, Post, Body, HttpCode } from '@nestjs/common';
import { IBlockQueryParams } from '../types/block.interface';
import { BlockService } from '../service/block.service';
import { Result } from '../api/ApiResult';
import { ListStruct } from '../api/ApiResult';
import { IBlock } from '../types/block.interface';


@Controller('blocks')
export class BlockController {
    constructor(private readonly blockService: BlockService) {
    }

    @Get()
    async queryBlockList(@Query() q: IBlockQueryParams): Promise<Result<ListStruct<any>>> {
        const data: ListStruct<any> = await this.blockService.queryBlockList(q);
        return new Result<any>(data);
    }

    @Get('latest')
    async queryLatestBlock(): Promise<Result<IBlock | null>> {
        const data: IBlock | null = await this.blockService.queryLatestBlock();
        return new Result<any>(data);
    }

    @Get(':height')
    async queryBlockDetail(@Param() p): Promise<Result<IBlock | null>> {
        const data: IBlock | null = await this.blockService.queryBlockDetail(p);
        return new Result<any>(data);
    }







}