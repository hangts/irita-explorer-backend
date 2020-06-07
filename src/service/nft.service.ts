import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { INftQueryParams, INft } from '../types/nft.interface';
import { ApiError, ListStruct } from '../api/ApiResult';
import { CreateNftDto } from '../dto/create.nft.dto';
import { cfg } from '../config';
import { ErrorCodes, ResultCodesMaps } from '../api/ResultCodes';
import { NftHttp } from '../http/nft.http';
import { DenomService } from './denom.service';
import { IDenom } from '../types/denom.interface';
import {INftEntities} from '../schema/nft.schema';

@Injectable()
export class NftService {
    constructor(@InjectModel('Nft') private nftModel: Model<INft>,
                @InjectModel('Denom') private denomModel: Model<IDenom>,
                private readonly nftHttp: NftHttp,
                ) {
    }

    async queryList(query: INftQueryParams): Promise<ListStruct<any[]>> {
        const { pageNumber, pageSize } = query;
        const nftList: any[] = await this.nftModel.find().skip(Number(pageNumber)).limit(Number(pageSize)).exec();
        return new ListStruct(nftList, Number(pageNumber), Number(pageSize), 0);
    }

    async createOne(data: CreateNftDto): Promise<CreateNftDto> {
        return {
            height: 100,
            hash: 'hello world',
            memo: '红豆生南国',
        };
    }


    async findDenomAndSyncNft() {
        const data: any = await (this.denomModel as any).findAllNames();
        if(data && data.length > 0){
            data.forEach(async (n, i)=>{
                const res: any = await this.nftHttp.queryNftsFromLcd(n.name);
                const nftFromDb: INftEntities[] = await (this.nftModel as any).findNftListByName(n.name);
                if(res){
                    let shouldInsertList: any[] = NftService.getShouldInsertList(res.nfts, nftFromDb);
                    let shouldDeleteNftList: any[] =  NftService.getShouldDeleteList(res.nfts, nftFromDb);
                    //console.log('should insert list:', shouldInsertList)
                    if(shouldInsertList.length > 0){
                        let insertNftList: any[] = shouldInsertList.map((nft)=>{
                            return {
                                denom: n.name,
                                nft_id: nft.value.id,
                                owner:nft.value.owner,
                                token_uri:nft.value.token_uri ? nft.value.token_uri : '',
                                token_data:nft.value.token_data ? nft.value.token_data : '',
                                create_time: Math.floor(new Date().getTime()/1000),
                                update_time: Math.floor(new Date().getTime()/1000),
                            }
                        });

                        await (this.nftModel as any).saveBulk(insertNftList);

                    }
                    if(shouldDeleteNftList.length > 0){
                        shouldDeleteNftList.forEach((nft)=>{
                            (this.nftModel as any).deleteOneByDenomAndId({
                                nft_id:nft.nft_id,
                                denom:n.name,
                            });
                        });

                    }

                }
            })
        }

    }

    static getShouldDeleteList(nftFromLcd: null | any[], nftFromDb: INftEntities[]): any[]{
        if(nftFromDb.length === 0){
            //如果db中已经没有nft, 则不需要执行delete操作
            return [];
        }else {
            if(!nftFromLcd){//如果从Lcd返回的Nft已经没有了, 则需要删除db中查出的所有的
                return nftFromDb
            }else{
                let o: INftEntities[] = [];
                nftFromDb.forEach((n)=>{
                    if(nftFromLcd.every((nf)=>n.nft_id !== nf.value.id)){
                        o.push(n);
                    }
                });
                return o;
            }
        }
    }

    static getShouldInsertList(nftFromLcd: null | any[], nftFromDb: INftEntities[]): any[]{
        if(nftFromDb.length === 0){
            return nftFromLcd ? nftFromLcd : [];
        }else {
            if(!nftFromLcd){
                return []
            }else{
                let o: any[] = [];
                nftFromLcd.forEach((n)=>{
                    if(nftFromDb.every((nf)=>nf.nft_id !== n.value.id)){
                        o.push(n);
                    }
                });
                return o;
            }
        }
    }



    async findNftListByName(name: string): Promise<INftEntities[]>{
        return await (this.nftModel as any).findNftListByName(name);
    }
}

