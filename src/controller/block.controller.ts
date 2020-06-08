import { Controller, Get, Param, Query, Res, Req, Post, Body, HttpCode,UsePipes } from '@nestjs/common';
import { BlockService } from '../service/block.service';
import { Result } from '../api/ApiResult';
import { ListStruct } from '../api/ApiResult';
import {ListValidationPipe} from '../pipe/list.validation.pipe';
import {BlockDetailValidationPipe} from '../pipe/block.detail.validation.pipe';
import {BlockListVo} from '../vo/block.vo';
import {BlockListResDto, BlockListReqDto} from '../dto/block.dto';



@Controller('blocks')
export class BlockController {
    constructor(private readonly blockService: BlockService) {
    }

    @UsePipes(new ListValidationPipe())
    @Get()
    async queryBlockList(@Query() q: BlockListReqDto): Promise<Result<ListStruct<BlockListResDto[]>>> {
        const data: ListStruct<BlockListResDto[]> = await this.blockService.queryBlockList(q);
        return new Result<ListStruct<BlockListResDto[]>>(data);
    }

    @Get('latest')
    async queryLatestBlock(): Promise<Result<BlockListResDto | null>> {
        const data: BlockListResDto | null = await this.blockService.queryLatestBlock();
        return new Result<BlockListResDto | null>(data);
    }

    @Get(':height')
    @UsePipes(new BlockDetailValidationPipe())
    async queryBlockDetail(@Param() p): Promise<Result<BlockListResDto | null>> {
        const data: BlockListResDto | null = await this.blockService.queryBlockDetail(p);
        return new Result<BlockListResDto | null>(data);
    }







}