import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct, Result } from '../api/ApiResult';
import {
    TxListReqDto,
    TxListWithHeightReqDto,
    TxListWithAddressReqDto,
    TxListWithNftReqDto,
    TxListWithServicesNameReqDto,
    ServicesDetailReqDto,
    PostTxTypesReqDto,
    PutTxTypesReqDto,
    DeleteTxTypesReqDto,
    TxWithHashReqDto, ServiceResDto, ServiceListReqDto, ServiceProvidersReqDto, ServiceProvidersResDto,
} from '../dto/txs.dto';
import { TxResDto, 
         TxTypeResDto } from '../dto/txs.dto';
import { IBindTx, IServiceName } from '../types/tx.interface';
import { ITxStruct } from '../types/schemaTypes/tx.interface';

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


    async findServiceList(query: ServiceListReqDto): Promise<ListStruct<ServiceResDto[]>>{
        const { pageNum, pageSize, useCount } = query;
        const serviceTxList: ITxStruct[] = await (this.txModel as any).findServiceAllList(pageNum, pageSize, useCount);
        const serviceNameList: IServiceName[] = serviceTxList.map((item: any)=>{
            return {
                serviceName: item.msgs[0].msg.ex.service_name,
                bind: item.msgs[0].msg.ex.bind,
            }
        });

        for(let name of serviceNameList){
            if(name.bind && name.bind > 0){
                const bindServiceTxList: ITxStruct[] = await (this.txModel as any).findBindServiceTxList(name.serviceName);
                const bindTxList: IBindTx[] = bindServiceTxList.map((item: any)=>{
                    return {
                        provider: item.msgs[0].msg.provider,
                        bindTime: item.time,
                    }
                });
                //查出每个provider在当前绑定的serviceName下所有的绑定次数
                for(let bindTx of bindTxList){
                    bindTx.respondTimes = await (this.txModel as any).findProviderRespondTimesForService(name.serviceName, bindTx.provider);
                }
                name.bindList = bindTxList;
            }else{
                name.bindList = [];
            }
        }
        const res: ServiceResDto[] = serviceNameList.map((service: IServiceName)=>{
            return new ServiceResDto(service.serviceName, service.bindList)
        });
        let count: number = 0;
        if (useCount) {
            count = await (this.txModel as any).findAllServiceCount();
        }
        return new ListStruct(res, pageNum, pageSize, count);
    }

    async queryServiceProviders(query: ServiceProvidersReqDto): Promise<ListStruct<ServiceProvidersResDto[]>>{
        const {serviceName, pageNum, pageSize, useCount} = query;
        const bindServiceTxList: ITxStruct[] = await (this.txModel as any).findBindServiceTxList(serviceName, pageNum, pageSize);
        const bindTxList: IBindTx[] = bindServiceTxList.map((item: any)=>{
            return {
                provider: item.msgs[0].msg.provider,
                bindTime: item.time,
            }
        });
        console.log(query,bindServiceTxList)
        //查出每个provider在当前绑定的serviceName下所有的绑定次数
        for(let bindTx of bindTxList){
            bindTx.respondTimes = await (this.txModel as any).findProviderRespondTimesForService(serviceName, bindTx.provider);
        }
        const res: ServiceProvidersResDto[] = bindTxList.map((service: ServiceProvidersResDto)=>{
            return new ServiceProvidersResDto(service.provider, service.respondTimes, service.bindTime);
        });

        let count: number = 0;
        if (useCount) {
            count = await (this.txModel as any).findServiceProviderCount(serviceName);
        }
        return new ListStruct(res, pageNum, pageSize, count);
    }


}

