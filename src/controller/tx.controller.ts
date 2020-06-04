import { Controller, Get, Param, Query, Res, Req, Post, Body, HttpCode } from '@nestjs/common';
import { TxService } from '../service/tx.service';
import { TxListReqDto, TxResDto } from '../dto/txs.dto';
import ValidationPipe from '../pipe/validation.pipe';
import { Result } from '../api/ApiResult';
import { ListStruct } from '../api/ApiResult';


@Controller('txs')
export class TxController {
    constructor(private readonly txService: TxService) {
    }

    @Get()
    async queryTxList(@Query(new ValidationPipe()) query: TxListReqDto): Promise<Result<ListStruct<TxResDto>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryTxList(query);
        return new Result<any>(data);
    }

    // @Get(":hash")
    // async queryTxWithHash(@Param(new ValidationPipe()) query: TxListReqDto): Promise<Result<TxResDto>> {
    //     const data: TxResDto = await this.txService.queryTxWithHash(query);
    //     return new Result<TxResDto>(data);
    // }
}