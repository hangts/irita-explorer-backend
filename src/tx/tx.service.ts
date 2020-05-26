import { Injectable } from '@nestjs/common';
import { TxRepoDto } from './dto/tx.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ITxQueryParams } from './types/tx.types';
import {ListResult} from '../api/ApiResult';

@Injectable()
export class TxService {
  constructor(@InjectModel('Tx') private txModel: Model<TxRepoDto<any, any>>) {
  }

  async queryTxList(query: ITxQueryParams): Promise<ListResult<any[]>> {
    const { pageNumber, pageSize } = query;
    console.log(query);
    const dataList:any[] = await this.txModel.find().skip(Number(pageNumber)).limit(Number(pageSize)).exec();
    return this.getListResult(dataList, Number(pageNumber), Number(pageSize), 0);
  }


  getListResult(data: any, pageNumber: number, pageSize: number, count: number){
    return new ListResult(data, Number(pageNumber), Number(pageSize), count);
  }




}
