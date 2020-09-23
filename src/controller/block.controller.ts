import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common';
import { BlockService } from '../service/block.service';
import { Result } from '../api/ApiResult';
import { ListStruct } from '../api/ApiResult';
import { 
    BlockListReqDto, 
    BlockDetailReqDto,
    ValidatorsetsReqDto } from '../dto/block.dto';
import { 
    BlockListResDto,
    ValidatorsetsResDto,
    BlockStakingResDto
     } from '../dto/block.dto';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('Blocks')
@Controller('blocks')
export class BlockController {
    constructor(private readonly blockService: BlockService) {
    }

    @Get()
    async queryBlockList(@Query() query: BlockListReqDto): Promise<Result<ListStruct<BlockListResDto[]>>> {
        const data: ListStruct<BlockListResDto[]> = await this.blockService.queryBlockList(query);
        return new Result<ListStruct<BlockListResDto[]>>(data);
    }

    @Get('latest')
    async queryLatestBlock(): Promise<Result<BlockListResDto | null>> {
        const data: BlockListResDto | null = await this.blockService.queryLatestBlock();
        return new Result<BlockListResDto | null>(data);
    }

    @Get('validatorset')
    async queryValidatorset(@Query() query: ValidatorsetsReqDto): Promise<Result<ListStruct<ValidatorsetsResDto[]>>> {
        const data: ListStruct<ValidatorsetsResDto[]> = await this.blockService.queryValidatorset(query);
        return new Result<ListStruct<ValidatorsetsResDto[]>>(data);
    }

    @Get('/staking/:height')
    async queryBlockStakingDetail(@Param() query: BlockDetailReqDto): Promise<Result<BlockStakingResDto | null>> {
        const data: BlockStakingResDto | null = await this.blockService.queryBlockStakingDetail(query);
        return new Result<BlockStakingResDto | null>(data);
    }

    @Get(':height')
    async queryBlockDetail(@Param() query: BlockDetailReqDto): Promise<Result<BlockListResDto | null>> {
        const data: BlockListResDto | null = await this.blockService.queryBlockDetail(query);
        return new Result<BlockListResDto | null>(data);
    }







}