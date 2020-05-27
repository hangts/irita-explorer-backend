import { Controller, Get, Param, Query, Res, Req, Post, Body, HttpCode } from '@nestjs/common';
import { ITxQueryParams } from '../types/tx.interface';
import { TxService } from '../service/tx.service';
import { CreateTxDto } from '../dto/create.tx.dto';
import { ValidationPipe } from '../pipe/tx.validation.pipe';
import { Result } from '../api/ApiResult';
import { ListStruct } from '../api/ApiResult';


@Controller('txs')
export class TxController {
    constructor(private readonly txService: TxService) {
    }

    @Get('trans')
    async queryTxList(@Query() q: ITxQueryParams): Promise<Result<ListStruct<any>>> {
        console.log(process.env.NODE_ENV);
        const data: ListStruct<any> = await this.txService.queryTxList(q);
        return new Result<any>(data);
    }

    @Post('create')
    async saveTx(@Body(new ValidationPipe()) createTxDto: CreateTxDto): Promise<CreateTxDto> {
        return {
            height: 100,
            hash: 'hello world',
            memo: '红豆生南国',
        };
    }
}