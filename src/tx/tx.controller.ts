import { Controller, Get, Param, Query, Res, Req, Post, Body, HttpCode } from '@nestjs/common';
import { txQueryParams, txPageParams } from './types/tx.types';
import { TxService } from './tx.service';
import { TxDto } from './dto/tx.dto';
import { CreateTxDto } from './dto/create.tx.dto';
import { ValidationPipe } from './pipe/tx.validation.pipe';
import { Result } from '../api/ApiResult';


@Controller('txs')
export class TxController {
  constructor(private readonly txService: TxService) {
  }

  @Get('/trans/:pageNumber/:pageSize')
  async getTxList(@Query() q: txQueryParams, @Param() p: txPageParams): Promise<Result<TxDto<any, any>[]>> {
    const data: TxDto<any, any>[] = await this.txService.getTxList(q, p);
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