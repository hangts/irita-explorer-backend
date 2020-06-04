import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TxListReqDto, TxResDto } from '../dto/txs.dto';
import { ListStruct } from '../api/ApiResult';
import { ITxsQuery } from '../types/tx.interface';
@Injectable()
export class TxService {
    constructor(@InjectModel('Tx') private txModel: any) {
    }

    async queryTxList(query: TxListReqDto): Promise<ListStruct<TxResDto[]>> {
        let txListData = await this.txModel.queryTxList(query)
        return new ListStruct(TxResDto.bundleData(txListData.data), Number(query.pageNumber), Number(query.pageSize), txListData.count);
    }

    // async queryTxWithHash(query: any): Promise<TxResDto> {
    //     return {} as TxResDto;
    // }
}

