import { Injectable } from '@nestjs/common';
import { TxRepoDto, TxDto } from './tx.dto';
import {Model} from 'mongoose';
import {InjectModel} from '@nestjs/mongoose';
import {txQueryParams} from './tx.types';

@Injectable()
export class TxService {
    constructor(@InjectModel('Tx') private txModel: Model<TxRepoDto<any, any>>){}

    async getTxList(p: txQueryParams, pageNumber: number, pageSize: number): Promise<TxDto<any, any>[]>{
        const {txType, status, beginTime, endTime} = p;
        const data = await this.txModel.find().exec();
        console.log(data);
        return [];
    }
}
