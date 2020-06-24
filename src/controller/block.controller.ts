import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common';
import { BlockService } from '../service/block.service';
import { Result } from '../api/ApiResult';
import { ListStruct } from '../api/ApiResult';
import { BlockListResDto, BlockListReqDto, BlockDetailReqDto } from '../dto/block.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Blocks')
@Controller('blocks')
export class BlockController {
    constructor(private readonly blockService: BlockService) {
    }

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
    async queryBlockDetail(@Param() p: BlockDetailReqDto): Promise<Result<BlockListResDto | null>> {
        const data: BlockListResDto | null = await this.blockService.queryBlockDetail(p);
        return new Result<BlockListResDto | null>(data);
    }







}