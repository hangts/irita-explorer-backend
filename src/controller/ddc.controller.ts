import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { DdcService } from '../service/ddc.service';
import { Result } from '../api/ApiResult';
import { ListStruct } from '../api/ApiResult';
import { DdcListReqDto, DdcListResDto, DdcDetailReqDto, DdcDetailResDto } from '../dto/ddc.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Ddcs')
@Controller('ddcs')
export class DdcController {
  constructor(private readonly ddcService: DdcService) {
  }

  @Get()
  async queryList(@Query() q: DdcListReqDto): Promise<Result<ListStruct<DdcListResDto[]>>> {
    const data: ListStruct<DdcListResDto[]> = await this.ddcService.queryList(q);
    return new Result<ListStruct<DdcListResDto[]>>(data);
  }

  @Get('details')
  async queryDetail(@Query() q: DdcDetailReqDto): Promise<Result<DdcDetailResDto | null>> {
    const data: DdcDetailResDto = await this.ddcService.queryDetail(q);
    return new Result<DdcDetailResDto | null>(data);
  }



}