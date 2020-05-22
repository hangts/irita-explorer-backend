import { Injectable } from '@nestjs/common';
import { TxRepoDto, TxDto } from './tx.dto';
import {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {txQueryParams, txPageParams} from './tx.types';

@Injectable()
export class TxService {
    constructor(@InjectModel('Tx') private txModel: Model<TxRepoDto<any, any>>){}

    async getTxList(query: txQueryParams, p: txPageParams): Promise<TxDto<any, any>[]>{
        const {txType, status, beginTime, endTime} = query;
        console.log(query)
        const data = await this.txModel.find().skip(Number(p.pageNumber)).limit(Number(p.pageSize)).exec();
        return data;
    }
}
