import { Controller, Get, Param, Query, Res, Req, Post, Body, HttpCode } from '@nestjs/common';
import { TxService } from '../service/tx.service';
import { TxsReqDto } from '../dto/txs.dto';
import ValidationPipe from '../pipe/validation.pipe';
import { Result } from '../api/ApiResult';
import { ListStruct } from '../api/ApiResult';


@Controller('txs')
export class TxController {
    constructor(private readonly txService: TxService) {
    }

    @Get()
    async queryTxList(@Query(new ValidationPipe()) query: TxsReqDto): Promise<Result<ListStruct<any>>> {
        const data: ListStruct<any> = await this.txService.queryTxList(query);
        return new Result<any>(data);
    }
}