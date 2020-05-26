import { Controller, Get, Param, Query, Res, Req, Post, Body, HttpCode } from '@nestjs/common';
import { ITxQueryParams } from './types/tx.types';
import { TxService } from './tx.service';
import { TxDto } from './dto/tx.dto';
import { CreateTxDto } from './dto/create.tx.dto';
import { ValidationPipe } from './pipe/tx.validation.pipe';
import { Result } from '../api/ApiResult';
import {IListResponseBase} from '../types';


@Controller('txs')
export class TxController {
  constructor(private readonly txService: TxService) {
  }

  @Get('/trans')
  async getTxList(@Query() q: ITxQueryParams): Promise<Result<IListResponseBase<any[]>>> {
    const data: IListResponseBase<any[]> = await this.txService.getTxList(q);
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