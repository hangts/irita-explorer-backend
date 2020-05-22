import { Controller, Get, Param, Query, Res, Req } from '@nestjs/common';
import {txQueryParams} from './tx.types';
import {TxService} from './tx.service';
import {TxDto} from './tx.dto';


@Controller('txs/trans/:pageNumber/:pageSize')
export class TxController {
    constructor(private readonly txService: TxService){}

    @Get()
    async getTxList(@Query() p: txQueryParams, @Param() pageNumber: number, @Param()pageSize: number): Promise<TxDto<any, any>[]>{
        return this.txService.getTxList(p, pageNumber, pageSize);
    }
}