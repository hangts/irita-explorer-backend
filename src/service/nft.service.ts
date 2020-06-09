import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct } from '../api/ApiResult';
import { NftHttp } from '../http/nft.http';
import { INftEntities } from '../schema/nft.schema';
import {IDenomEntities} from '../schema/denom.schema';
import { NftDetailReqDto, NftDetailResDto, NftListReqDto, NftListResDto } from '../dto/nft.dto';
import md5 from 'blueimp-md5';

@Injectable()
export class NftService {
    constructor(@InjectModel('Nft') private nftModel: Model<INftEntities>,
                @InjectModel('Denom') private denomModel: Model<IDenomEntities>,
                private readonly nftHttp: NftHttp,
    ) {
    }

    async queryList(query: NftListReqDto): Promise<ListStruct<NftListResDto[]>> {
        const { pageNum, pageSize, denom, owner, useCount } = query;
        const nftList: any[] = await (this.nftModel as any).findList(Number(pageNum), Number(pageSize), denom, owner);
        const res: NftListResDto[] = nftList.map((n) => {
            return new NftListResDto(n.denom, n.nft_id, n.owner, n.token_uri, n.token_data, n.create_time, n.update_time);
        });
        let count: number = 0;
        if (useCount) {
            count = await (this.nftModel as any).queryCount();
        }
        return new ListStruct(res, Number(pageNum), Number(pageSize), count);
    }

    async queryDetail(query: NftDetailReqDto): Promise<NftDetailResDto> {
        const { denom, nftId } = query;
        const n: any = await (this.nftModel as any).findOneByDenomAndNftId(denom, nftId);
        if (n) {
            return new NftListResDto(n.denom, n.nft_id, n.owner, n.token_uri, n.token_data, n.create_time, n.update_time);
        } else {
            return null;
        }
    }


    async findDenomAndSyncNft():Promise<boolean> {
        const data: any = await (this.denomModel as any).findAllNames();
        if (data && data.length > 0) {
            return new Promise((resolve)=>{
                let arr: any[] = [];
                const promiseContainer = async (n) => {
                    const res: any = await this.nftHttp.queryNftsFromLcd(n.name);
                    const nftFromDb: INftEntities[] = await (this.nftModel as any).findNftListByName(n.name);
                    if (res) {
                        let shouldInsertList: any[] = NftService.getShouldInsertList(res.nfts, nftFromDb);
                        let shouldDeleteNftList: INftEntities[] = NftService.getShouldDeleteList(res.nfts, nftFromDb);
                        let shouldUpdateNftList: any[] = NftService.getShouldUpdateList(res.nfts, nftFromDb);
                        await this.saveNft(n, shouldInsertList);
                        await this.deleteNft(n, shouldDeleteNftList);
                        await this.updateNft(n, shouldUpdateNftList);
                    }
                };
                data.forEach((n) => {
                    arr.push(promiseContainer(n))
                });
                Promise.all(arr).then((res)=>{
                    if(res) {
                        console.log('all of step asynchronous have completed now');
                        resolve(true);
                        //all of step asynchronous have completed now;
                    }
                }).catch((e)=>{
                    new Logger('sync nft failed:',e.message);
                })
            })
        }else {
            return true;
        }

    }

    async saveNft(n:any, shouldInsertList: any[]): Promise<boolean>{
        if (shouldInsertList.length > 0) {
            let insertNftList: any[] = shouldInsertList.map((nft) => {
                const str: string = `${nft.value.owner}${nft.value.token_uri ? nft.value.token_uri : ''}${nft.value.token_data ? nft.value.token_data : ''}`;
                const hash = md5(str);
                return {
                    denom: n.name,
                    nft_id: nft.value.id,
                    owner: nft.value.owner,
                    token_uri: nft.value.token_uri ? nft.value.token_uri : '',
                    token_data: nft.value.token_data ? nft.value.token_data : '',
                    create_time: Math.floor(new Date().getTime() / 1000),
                    update_time: Math.floor(new Date().getTime() / 1000),
                    hash,
                };
            });
            const saved: any = await (this.nftModel as any).saveBulk(insertNftList);
            console.log('insert nft has completed!')
            if(saved) return true;
        }else {
            return true;
        }
    }

    async deleteNft(n:any, shouldDeleteNftList: any[]): Promise<boolean>{
        if (shouldDeleteNftList.length > 0) {
            return new Promise((resolve)=>{
                let arr: any[] = [];
                const promiseContainer = async (nft)=> {
                    await (this.nftModel as any).deleteOneByDenomAndId({
                        nft_id: nft.nft_id,
                        denom: n.name,
                    });
                };
                shouldDeleteNftList.forEach((nft) => {
                    arr.push(promiseContainer(nft))
                });
                Promise.all(arr).then((res)=>{
                    if(res) {
                        console.log('delete nft has completed!')
                        resolve(true);
                    }
                }).catch((e)=>{
                    new Logger('delete nft failed:',e.message);
                })
            })
        }else{
            return true;
        }
    }

    async updateNft(n:any, shouldUpdateNftList: any[]): Promise<boolean>{
        if (shouldUpdateNftList.length > 0) {
            return new Promise((resolve)=>{
                let arr: any[] = [];
                const promiseContainer = async (nft)=> {
                    await (this.nftModel as any).updateOneById({
                        nft_id: nft.value.id,
                        owner: nft.value.owner,
                        token_uri: nft.value.token_uri,
                        token_data: nft.value.token_data,
                        hash:nft.hash,
                    });
                };
                shouldUpdateNftList.forEach((nft) => {
                    arr.push(promiseContainer(nft))
                });
                Promise.all(arr).then((res)=>{
                    if(res) {
                        console.log('update nft has completed!')
                        resolve(true);
                    }
                }).catch((e)=>{
                    new Logger('updated nft failed:',e.message);
                })
            })
        }else{
            return true;
        }
    }

    static getShouldDeleteList(nftFromLcd: null | any[], nftFromDb: INftEntities[]): any[] {
        if (nftFromDb.length === 0) {
            //如果db中已经没有nft, 则不需要执行delete操作
            return [];
        } else {
            if (!nftFromLcd) {//如果从Lcd返回的Nft已经没有了, 则需要删除db中查出的所有的
                return nftFromDb;
            } else {
                let o: INftEntities[] = [];
                nftFromDb.forEach((n) => {
                    if (nftFromLcd.every((nf) => n.nft_id !== nf.value.id)) {
                        o.push(n);
                    }
                });
                return o;
            }
        }
    }

    static getShouldInsertList(nftFromLcd: null | any[], nftFromDb: INftEntities[]): any[] {
        if (nftFromDb.length === 0) {
            return nftFromLcd ? nftFromLcd : [];
        } else {
            if (!nftFromLcd) {
                return [];
            } else {
                let o: any[] = [];
                nftFromLcd.forEach((n) => {
                    if (nftFromDb.every((nf) => nf.nft_id !== n.value.id)) {
                        o.push(n);
                    }
                });
                return o;
            }
        }
    }

    static getShouldUpdateList(nftFromLcd: null | any[], nftFromDb: INftEntities[]): any[] {
        if (nftFromDb.length === 0) {
            return nftFromLcd ? nftFromLcd : [];
        } else {
            /*let lcd = {
                "type": "irismod/nft/BaseNFT",
                "value": {
                    "id": "i001",
                    "owner": "csrb199v0qu28ynmjr2q3a0nqgcp9pyy5almmj4laec",
                    "token_data": "{\"visible\":true,\"report\":{\"header\":[\"只数\",\"金额\"],\"data\":[[\"\",\"6303.3186841154\"]],\"date\":{\"start\":\"2020-02-01\",\"end\":\"2020-02-29\",\"type\":\"M\"}}}"
                }
            };*/
            if (!nftFromLcd) {
                return [];
            } else {
                let o: any[] = [];
                nftFromDb.forEach((n) => {
                    nftFromLcd.forEach((nl) => {
                        if (nl.value.id === n.nft_id) {
                            //compare difference by hash;
                            const lcdStr = `${nl.value.owner}${nl.value.token_uri ? nl.value.token_uri : ''}${nl.value.token_data ? nl.value.token_data : ''}`;
                            const lcdHash = md5(lcdStr);
                            nl.hash = lcdHash;
                            if (lcdHash !== n.hash) {
                                o.push(nl);
                            }
                        }
                    });
                });
                return o;
            }
        }
    }

    async findNftListByName(name: string): Promise<INftEntities[]> {
        return await (this.nftModel as any).findNftListByName(name);
    }
}

