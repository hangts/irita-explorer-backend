import { Controller, Get, Param, Query, Res, Req, Post, Body, HttpCode } from '@nestjs/common';
import { ITxQueryParams } from './types/tx.types';
import { TxService } from './tx.service';
import { CreateTxDto } from './dto/create.tx.dto';
import { ValidationPipe } from './pipe/tx.validation.pipe';
import { Result } from '../api/ApiResult';
import {ListResult} from '../api/ApiResult';


@Controller('txs')
export class TxController {
  constructor(private readonly txService: TxService) {
  }

  @Get('/trans')
  async queryTxList(@Query() q: ITxQueryParams): Promise<Result<ListResult<any>>> {
    const data: ListResult<any> = await this.txService.queryTxList(q);
    return new Result<any>(data);
  }

  @Post('create')
  @HttpCode(205)
  async saveTx(@Body(new ValidationPipe()) createTxDto: CreateTxDto): Promise<CreateTxDto> {

    console.log(createTxDto);
    return {
      height: 100,
      hash: 'hello world',
      memo: '红豆生南国',
    };
  }
}