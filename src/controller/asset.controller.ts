import { Controller, Get, Param, Query } from '@nestjs/common';
import { AssetService } from '../service/asset.service';
import { Result } from '../api/ApiResult';
import { ListStruct } from '../api/ApiResult';
import { 
    AssetListReqDto,
    AssetDetailReqDto
} from '../dto/asset.dto';
import { 
    AssetListResDto,
    AssetDetailResDto
} from '../dto/asset.dto';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('Asset')
@Controller('asset')
export class AssetController {
    constructor(private readonly assetService: AssetService) {
    }

    @Get('tokens')
    async queryTokensList(@Query() query: AssetListReqDto): Promise<Result<ListStruct<AssetListResDto[]>>> {
        const data: ListStruct<AssetListResDto[]> = await this.assetService.queryTokensList(query);
        return new Result<ListStruct<AssetListResDto[]>>(data);
    }

    @Get('tokens/:symbol')
    async queryTokenDetail(@Param() query: AssetDetailReqDto): Promise<Result<AssetDetailResDto | null>> {
        const data: AssetDetailResDto | null = await this.assetService.queryTokenDetail(query);
        return new Result<AssetDetailResDto | null>(data);
    }
}
