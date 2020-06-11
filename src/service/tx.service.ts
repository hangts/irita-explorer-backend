import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct } from '../api/ApiResult';
import Util from '../util/util';
import { TxListReqDto, 
         TxListWithHeightReqDto,
         TxListWithAddressReqDto,
         TxListWithNftReqDto,
         TxListWithServicesNameReqDto,
         ServicesDetailReqDto,
         PostTxTypesReqDto,
         PutTxTypesReqDto,
         DeleteTxTypesReqDto,
         TxWithHashReqDto} from '../dto/txs.dto';
import { TxResDto, 
         TxTypeResDto } from '../dto/txs.dto';

@Injectable()
export class TxService {
    constructor(@InjectModel('Tx') private txModel: any, 
                @InjectModel('TxType') private txTypeModel: any) {
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

    //  txs/types
    async queryTxTypeList(): Promise<ListStruct<TxTypeResDto[]>> {
        let txTypeListData = await this.txTypeModel.queryTxTypeList();
        return new ListStruct(TxTypeResDto.bundleData(txTypeListData), Number(0), Number(0));
    }

    //  post txs/types
    async insertTxTypes(prarms: PostTxTypesReqDto): Promise<ListStruct<TxTypeResDto[]>> {
        let txTypeListData = await this.txTypeModel.insertTxTypes(prarms.typeNames);
        return new ListStruct(TxTypeResDto.bundleData(txTypeListData), Number(0), Number(0));
    }

    //  put txs/types
    async updateTxType(prarms: PutTxTypesReqDto): Promise<TxTypeResDto>  {
        let result:TxTypeResDto|null = null;
        let txData = await this.txTypeModel.updateTxType(prarms.typeName,prarms.newTypeName);
        if (txData) {
            result = new TxTypeResDto(txData);
        }
        return result;
    }

    //  delete txs/types
    async deleteTxType(prarms: DeleteTxTypesReqDto): Promise<TxTypeResDto>  {
        let result:TxTypeResDto|null = null;
        let txData = await this.txTypeModel.deleteTxType(prarms.typeName);
        if (txData) {
            result = new TxTypeResDto(txData);
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

