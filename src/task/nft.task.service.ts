import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { NftHttp } from '../http/lcd/nft.http';
import { INftEntities } from '../types/nft.interface';
import { IDenomEntities } from '../types/denom.interface';
import md5 from 'blueimp-md5';
import { getTimestamp } from '../util/util';
import { ILcdNftStruct } from '../types/task.interface';

@Injectable()
export class NftTaskService {
    constructor(@InjectModel('Nft') private nftModel: Model<INftEntities>,
                @InjectModel('Denom') private denomModel: Model<IDenomEntities>,
                private readonly nftHttp: NftHttp,
    ) {
        this.doTask = this.doTask.bind(this);
    }

    doTask(): Promise<void> {
        return new Promise(async (resolve) => {
            const nameList: any[] = await (this.denomModel as any).findAllNames();
            if (nameList && nameList.length > 0) {
                let arr: any[] = [];
                const promiseContainer = (nameOjb) => {
                    return new Promise(async (subRes) => {
                        const res: any = await this.nftHttp.queryNftsFromLcd(nameOjb.name);
                        const nftFromDb: INftEntities[] = await (this.nftModel as any).findNftListByName(nameOjb.name);
                        if (res) {
                            let lcdNftMap: Map<string, ILcdNftStruct> | null = new Map<string, ILcdNftStruct>(),
                                dbNftMap: Map<string, INftEntities> | null = new Map<string, INftEntities>();
                            if (res.nfts && Array.isArray(res.nfts) && res.nfts.length > 0) {
                                res.nfts.forEach(nft => {
                                    lcdNftMap.set(nft.value.id, nft.value);
                                });
                            }else{
                                lcdNftMap = null
                            }

                            if (nftFromDb.length > 0) {
                                nftFromDb.forEach((nft: INftEntities) => {
                                    dbNftMap.set(nft.nft_id, nft);
                                });
                            }else{
                                dbNftMap = null
                            }

                            let shouldInsertMap: Map<string, ILcdNftStruct> = NftTaskService.getShouldInsertList(lcdNftMap, dbNftMap);
                            let shouldDeleteNftMap: Map<string, INftEntities> = NftTaskService.getShouldDeleteList(lcdNftMap, dbNftMap);
                            let shouldUpdateNftMap: Map<string, ILcdNftStruct> = NftTaskService.getShouldUpdateList(lcdNftMap, dbNftMap);
                            await this.saveNft(nameOjb.name, shouldInsertMap);
                            await this.deleteNft(nameOjb.name, shouldDeleteNftMap);
                            await this.updateNft(nameOjb.name, shouldUpdateNftMap);
                            subRes();
                        } else {
                            subRes();
                        }
                    });

                };
                nameList.forEach((nameOjb) => {
                    arr.push(promiseContainer(nameOjb));
                });
                Promise.all(arr).then((res) => {
                    if (res) {
                        console.log('all of step asynchronous have completed now');
                        resolve();
                        //all of step asynchronous have completed now;
                    }
                }).catch((e) => {
                    resolve();
                    new Logger('sync nft failed:', e.message);
                });
            } else {
                resolve();
            }
        });


    }

    private async saveNft(name: any, shouldInsertMap: Map<string, ILcdNftStruct>): Promise<boolean> {
        if (shouldInsertMap && shouldInsertMap.size > 0) {
            let insertNftList: any[] = Array.from(shouldInsertMap.values()).map((nft) => {
                const { owner, token_uri, token_data, id } = nft;
                const str: string = `${owner}${token_uri ? token_uri : ''}${token_data ? token_data : ''}`, hash = md5(str);
                return {
                    denom: name,
                    nft_id: id,
                    owner: owner,
                    token_uri: token_uri ? token_uri : '',
                    token_data: token_data ? token_data : '',
                    create_time: getTimestamp(),
                    update_time: getTimestamp(),
                    hash,
                };
            });
            const saved: any = await (this.nftModel as any).saveBulk(insertNftList);
            console.log('insert nft has completed!');
            if (saved) return true;
        } else {
            return true;
        }
    }

    private async deleteNft(name: any, shouldDeleteNftMap: Map<string, INftEntities>): Promise<boolean> {
        if (shouldDeleteNftMap && shouldDeleteNftMap.size > 0) {
            return new Promise((resolve) => {
                let arr: any[] = [];
                const promiseContainer = (nft) => {
                    return new Promise(async (subRes) => {
                        await (this.nftModel as any).deleteOneByDenomAndId({
                            nft_id: nft.nft_id,
                            denom: name,
                        });
                        subRes();
                    });

                };
                Array.from(shouldDeleteNftMap.values()).forEach((nft) => {
                    arr.push(promiseContainer(nft));
                });
                Promise.all(arr).then((res) => {
                    if (res) {
                        resolve(true);
                    }
                });
            });
        } else {
            return true;
        }
    }

    private async updateNft(name: any, shouldUpdateNftMap: Map<string, ILcdNftStruct>): Promise<boolean> {
        if (shouldUpdateNftMap && shouldUpdateNftMap.size > 0) {
            return new Promise((resolve) => {
                let arr: any[] = [];
                const promiseContainer = (nft) => {
                    return new Promise(async (subRes) => {
                        const {id, owner, token_uri, token_data, hash} = nft;
                        await (this.nftModel as any).updateOneById({
                            nft_id: id,
                            owner: owner,
                            token_uri: token_uri,
                            token_data: token_data,
                            hash: hash,
                            denom: name,
                        });
                        subRes();
                    });
                };
                Array.from(shouldUpdateNftMap.values()).forEach((nft) => {
                    arr.push(promiseContainer(nft));
                });
                Promise.all(arr).then((res) => {
                    if (res) {
                        resolve(true);
                    }
                });
            });
        } else {
            return true;
        }
    }

    private static getShouldDeleteList(nftFromLcd: Map<string, any> | null, nftFromDb: Map<string, INftEntities> | null): Map<string, INftEntities> {
        if (!nftFromDb) {
            //如果db中已经没有nft, 则不需要执行delete操作
            return new Map<string, INftEntities>();
        } else {
            if (!nftFromLcd) {//如果从Lcd返回的Nft已经没有了, 则需要删除db中查出的所有的
                return nftFromDb;
            } else {
                const deleteNftMap = new Map<string, INftEntities>();
                for (let key of nftFromDb.keys()) {
                    if (!nftFromLcd.has(key)) {
                        deleteNftMap.set(key, nftFromDb.get(key));
                    }
                }
                return deleteNftMap;
            }
        }
    }

    private static getShouldInsertList(nftFromLcd: Map<string, ILcdNftStruct> | null, nftFromDb: Map<string, INftEntities> | null): Map<string, ILcdNftStruct> {
        if (!nftFromDb) {
            return nftFromLcd;
        } else {
            if (!nftFromLcd) {
                return new Map<string, ILcdNftStruct>();
            } else {
                const insertNftMap = new Map<string, ILcdNftStruct>();
                for (let key of nftFromLcd.keys()) {
                    if (!nftFromDb.has(key)) {
                        insertNftMap.set(key, nftFromLcd.get(key));
                    }
                }
                return insertNftMap;
            }
        }
    }

    private static getShouldUpdateList(nftFromLcd: Map<string, ILcdNftStruct> | null, nftFromDb: Map<string, INftEntities> | null): Map<string, ILcdNftStruct> {
        if (!nftFromDb) {
            return new Map<string, ILcdNftStruct>();
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
                return new Map<string, ILcdNftStruct>();
            } else {
                const updateNftMap = new Map<string, ILcdNftStruct>();
                for (let key of nftFromLcd.keys()) {
                    if (nftFromDb.has(key)) {
                        const { owner, token_data, token_uri } = nftFromLcd.get(key),
                            lcdStr = `${owner}${token_uri ? token_uri : ''}${token_data ? token_data : ''}`,
                            lcdHash = md5(lcdStr);
                        if (nftFromDb.get(key).hash !== lcdHash) {
                            let tempLcdNft: ILcdNftStruct = nftFromLcd.get(key);
                            tempLcdNft.hash = lcdHash;
                            updateNftMap.set(key, tempLcdNft);
                        }
                    }
                }
                return updateNftMap;
            }
        }
    }


}

