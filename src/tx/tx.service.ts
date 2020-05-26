import { Injectable } from '@nestjs/common';
import { TxRepoDto } from './dto/tx.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ITxQueryParams } from './types/tx.types';
import {IListResponseBase} from '../types';

@Injectable()
export class TxService {
  constructor(@InjectModel('Tx') private txModel: Model<TxRepoDto<any, any>>) {
  }

  async getTxList(query: ITxQueryParams): Promise<IListResponseBase<any[]>> {
    const { pageNumber, pageSize } = query;
    console.log(query);
    const dataList:any[] = await this.txModel.find().skip(Number(pageNumber)).limit(Number(pageSize)).exec();
    return {
      data:dataList,
      pageNumber: Number(pageNumber),
      pageSize:Number(pageSize),
      count:0,
    }
  }
}
