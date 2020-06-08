import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct } from '../api/ApiResult';
import { NftHttp } from '../http/nft.http';
import { IDenom } from '../types/denom.interface';
import { INftEntities } from '../schema/nft.schema';
import { NftDetailReqDto, NftDetailResDto, NftListReqDto, NftListResDto } from '../dto/nft.dto';
import md5 from 'blueimp-md5';

@Injectable()
export class NftService {
    constructor(@InjectModel('Nft') private nftModel: Model<INftEntities>,
                @InjectModel('Denom') private denomModel: Model<IDenom>,
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


    async findDenomAndSyncNft():Promise<any> {
        const data: any = await (this.denomModel as any).findAllNames();
        if (data && data.length > 0) {
            data.forEach(async (n, i) => {
                const res: any = await this.nftHttp.queryNftsFromLcd(n.name);
                const nftFromDb: INftEntities[] = await (this.nftModel as any).findNftListByName(n.name);
                if (res) {
                    let shouldInsertList: any[] = NftService.getShouldInsertList(res.nfts, nftFromDb);
                    let shouldDeleteNftList: INftEntities[] = NftService.getShouldDeleteList(res.nfts, nftFromDb);
                    let shouldUpdateNftList: any[] = NftService.getShouldUpdateList(res.nfts, nftFromDb);
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
                        await (this.nftModel as any).saveBulk(insertNftList);
                    }
                    if (shouldDeleteNftList.length > 0) {
                        shouldDeleteNftList.forEach(async (nft) => {
                            await (this.nftModel as any).deleteOneByDenomAndId({
                                nft_id: nft.nft_id,
                                denom: n.name,
                            });
                        });

                    }

                    if (shouldUpdateNftList.length > 0) {
                        shouldUpdateNftList.forEach(async (nft) => {
                            await (this.nftModel as any).updateOneById({
                                nft_id: nft.value.id,
                                owner: nft.value.owner,
                                token_uri: nft.value.token_uri,
                                token_data: nft.value.token_data,
                            });
                        });
                    }

                }
            });
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

