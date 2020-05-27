import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ITxQueryParams } from '../types/tx.interface';
import { ListStruct } from '../api/ApiResult';
import { ITx } from '../types/tx.interface';

@Injectable()
export class TxService {
    constructor(@InjectModel('Tx') private txModel: Model<ITx<any, any>>) {
    }

    async queryTxList(query: ITxQueryParams): Promise<ListStruct<any[]>> {
        const { pageNumber, pageSize } = query;
        const dataList: any[] = await this.txModel.find().skip(Number(pageNumber)).limit(Number(pageSize)).exec();
        return this.getListResult(dataList, Number(pageNumber), Number(pageSize), 0);
    }

    getListResult(data: any, pageNumber: number, pageSize: number, count: number) {
        return new ListStruct(data, Number(pageNumber), Number(pageSize), count);
    }


}
