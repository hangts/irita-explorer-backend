import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { TxListReqDto, 
         TxResDto, 
         TxListWithHeightReqDto,
         TxListWithAddressReqDto,
         TxListWithNftReqDto,
         TxListWithServicesNameReqDto,
         ServicesDetailReqDto,
         TxWithHashReqDto} from '../dto/txs.dto';
import { ListStruct } from '../api/ApiResult';
@Injectable()
export class TxService {
    constructor(@InjectModel('Tx') private txModel: any) {
    }

    // txs
    async queryTxList(query: TxListReqDto): Promise<ListStruct<TxResDto[]>> {
        let txListData = await this.txModel.queryTxList(query);
        return new ListStruct(TxResDto.bundleData(txListData.data), Number(query.pageNum), Number(query.pageSize), txListData.count);
    }

    // txs/blocks
    async queryTxWithHeight(query: TxListWithHeightReqDto): Promise<ListStruct<TxResDto[]>> {
        let txListData = await this.txModel.queryTxWithHeight(query);
        return new ListStruct(TxResDto.bundleData(txListData.data), Number(query.pageNum), Number(query.pageSize), txListData.count);
    }

    //  txs/addresses
    async queryTxWithAddress(query: TxListWithAddressReqDto): Promise<ListStruct<TxResDto[]>> {
        let txListData = await this.txModel.queryTxWithAddress(query);
        return new ListStruct(TxResDto.bundleData(txListData.data), Number(query.pageNum), Number(query.pageSize), txListData.count);
    }

    //  txs/nfts
    async queryTxWithNft(query: TxListWithNftReqDto): Promise<ListStruct<TxResDto[]>> {
        let txListData = await this.txModel.queryTxWithNft(query);
        return new ListStruct(TxResDto.bundleData(txListData.data), Number(query.pageNum), Number(query.pageSize), txListData.count);
    }
    
    //  txs/services
    async queryTxWithServiceName(query: TxListWithServicesNameReqDto): Promise<ListStruct<TxResDto[]>> {
        let txListData = await this.txModel.queryTxWithServiceName(query);
        return new ListStruct(TxResDto.bundleData(txListData.data), Number(query.pageNum), Number(query.pageSize), txListData.count);
    }
    
    //  txs/services/detail/{serviceName}
    async queryTxDetailWithServiceName(query: ServicesDetailReqDto): Promise<TxResDto> {
        let result:TxResDto|null = null;
        let txData = await this.txModel.queryTxDetailWithServiceName(query.serviceName);
        if (txData) {
            result = new TxResDto(txData);
        }
        return result;
    }

    //  txs/{hash}
    async queryTxWithHash(query: TxWithHashReqDto): Promise<TxResDto> {
        let result:TxResDto|null = null;
        let txData = await this.txModel.queryTxWithHash(query.hash);
        if (txData) {
            result = new TxResDto(txData);
        }
        return result;
    }
}

