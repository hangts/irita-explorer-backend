import { Controller, Get, Param, Query, Res, Req, Post, Body, HttpCode,UsePipes } from '@nestjs/common';
import { BlockService } from '../service/block.service';
import { Result } from '../api/ApiResult';
import { ListStruct } from '../api/ApiResult';
import {ListValidationPipe} from '../pipe/list.validation.pipe';
import {BlockListVo} from '../vo/block.vo';
import {BlockDto} from '../dto/block.dto';



@Controller('blocks')
export class BlockController {
    constructor(private readonly blockService: BlockService) {
    }

    @UsePipes(new ListValidationPipe())
    @Get()
    async queryBlockList(@Query() q: BlockListVo): Promise<Result<ListStruct<BlockDto[]>>> {
        const data: ListStruct<BlockDto[]> = await this.blockService.queryBlockList(q);
        return new Result<ListStruct<BlockDto[]>>(data);
    }

    @Get('latest')
    async queryLatestBlock(): Promise<Result<BlockDto | null>> {
        const data: BlockDto | null = await this.blockService.queryLatestBlock();
        return new Result<any>(data);
    }

    @Get(':height')
    async queryBlockDetail(@Param() p): Promise<Result<BlockDto | null>> {
        const data: BlockDto | null = await this.blockService.queryBlockDetail(p);
        return new Result<any>(data);
    }







}