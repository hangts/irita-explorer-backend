import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TxListReqDto, TxListResDto } from '../dto/txs.dto';
import { ListStruct } from '../api/ApiResult';
import { ITxsQueryParams } from '../types/tx.interface';

@Injectable()
export class TxService {
    constructor(@InjectModel('Tx') private txModel: any) {
    }

    async queryTxList(query: TxListReqDto): Promise<ListStruct<TxListResDto[]>> {
        let result:{count?:number, data?:any} = {};
        let queryParameters:ITxsQueryParams = {};
        if (query.type && query.type.length) { queryParameters.type = query.type}
        if (query.status && query.status.length) { 
            switch(query.status){
                case '1':
                queryParameters.status = 1; 
                break;
                case '2':
                queryParameters.status = 0; 
                break;
            }
        }
        if (query.beginTime && query.beginTime.length) { queryParameters.time.$gte =  new Date(Number(query.beginTime) * 1000) }
        if (query.endTime && query.endTime.length) { queryParameters.time.$lte =  new Date(Number(query.endTime) * 1000) }
        result.data =  await this.txModel.findTx(queryParameters, Number(query.pageNumber) - 1, query.pageSize);
        
        if (query.useCount && query.useCount=='true') {
            result.count = await this.txModel.count(queryParameters);
        }

        return new ListStruct(TxListResDto.getDisplayData(result.data), Number(query.pageNumber), Number(query.pageSize), result.count);
    }
}

