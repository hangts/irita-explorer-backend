import { Controller, Get, Param, Query, Res, Req } from '@nestjs/common';
import {txQueryParams, txPageParams} from './tx.types';
import {TxService} from './tx.service';
import {TxDto} from './dto/tx.dto';


@Controller('txs/trans/:pageNumber/:pageSize')
export class TxController {
    constructor(private readonly txService: TxService){}

    @Get()
    async getTxList(@Query() q: txQueryParams, @Param() p: txPageParams): Promise<TxDto<any, any>[]>{
        return this.txService.getTxList(q, p);
    }
}