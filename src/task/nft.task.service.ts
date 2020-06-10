import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { NftHttp } from '../http/lcd/nft.http';
import { INftEntities } from '../types/nft.interface';
import { IDenomEntities } from '../types/denom.interface';
import md5 from 'blueimp-md5';
import { getTimestamp } from '../util/util';

@Injectable()
export class NftTaskService {
    constructor(@InjectModel('Nft') private nftModel: Model<INftEntities>,
        @InjectModel('Denom') private denomModel: Model<IDenomEntities>,
        private readonly nftHttp: NftHttp,
    ) {
        this.doTask = this.doTask.bind(this);
    }

    async doTask(): Promise<boolean> {
        const nameList: any[] = await (this.denomModel as any).findAllNames();
        if (nameList && nameList.length > 0) {
            return new Promise((resolve) => {
                let arr: any[] = [];
                const promiseContainer = (nameOjb) => {
                    return new Promise(async (subRes)=>{
                        const res: any = await this.nftHttp.queryNftsFromLcd(nameOjb.name);
                        const nftFromDb: INftEntities[] = await (this.nftModel as any).findNftListByName(nameOjb.name);
                        if (res) {
                            let shouldInsertList: any[] = NftTaskService.getShouldInsertList(res.nfts ? res.nfts : [], nftFromDb);
                            let shouldDeleteNftList: INftEntities[] = NftTaskService.getShouldDeleteList(res.nfts ? res.nfts : [], nftFromDb);
                            let shouldUpdateNftList: any[] = NftTaskService.getShouldUpdateList(res.nfts ? res.nfts : [], nftFromDb);
                            await this.saveNft(nameOjb, shouldInsertList);
                            await this.deleteNft(nameOjb, shouldDeleteNftList);
                            await this.updateNft(nameOjb, shouldUpdateNftList);
                            subRes();
                        }else{
                            subRes();
                        }
                    })

                };
                nameList.forEach((nameOjb) => {
                    arr.push(promiseContainer(nameOjb))
                });
                Promise.all(arr).then((res) => {
                    if (res) {
                        console.log('all of step asynchronous have completed now');
                        resolve(true);
                        //all of step asynchronous have completed now;
                    }
                }).catch((e) => {
                    resolve(true);
                    new Logger('sync nft failed:', e.message);
                })
            })
        } else {
            return true;
        }

    }

    private async saveNft(n: any, shouldInsertList: any[]): Promise<boolean> {
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

    private async deleteNft(n: any, shouldDeleteNftList: any[]): Promise<boolean> {
        if (shouldDeleteNftList.length > 0) {
            return new Promise((resolve) => {
                let arr: any[] = [];
                const promiseContainer = (nft) => {
                    return new Promise(async (subRes)=>{
                        await (this.nftModel as any).deleteOneByDenomAndId({
                            nft_id: nft.nft_id,
                            denom: n.name,
                        });
                        subRes();
                    })

                };
                shouldDeleteNftList.forEach((nft) => {
                    arr.push(promiseContainer(nft))
                });
                Promise.all(arr).then((res) => {
                    if (res) {
                        resolve(true);
                    }
                })
            })
        } else {
            return true;
        }
    }

    private async updateNft(n: any, shouldUpdateNftList: any[]): Promise<boolean> {
        if (shouldUpdateNftList.length > 0) {
            return new Promise((resolve) => {
                let arr: any[] = [];
                const promiseContainer = (nft) => {
                    return new Promise(async (subRes)=>{
                        await (this.nftModel as any).updateOneById({
                            nft_id: nft.value.id,
                            owner: nft.value.owner,
                            token_uri: nft.value.token_uri,
                            token_data: nft.value.token_data,
                            hash: nft.hash,
                        });
                        subRes();
                    })
                };
                shouldUpdateNftList.forEach((nft) => {
                    arr.push(promiseContainer(nft))
                });
                Promise.all(arr).then((res) => {
                    if (res) {
                        resolve(true);
                    }
                })
            })
        } else {
            return true;
        }
    }

    private static getShouldDeleteList(nftFromLcd: any[], nftFromDb: INftEntities[]): any[] {
        if (nftFromDb.length === 0) {
            //如果db中已经没有nft, 则不需要执行delete操作
            return [];
        } else {
            if (nftFromLcd.length === 0) {//如果从Lcd返回的Nft已经没有了, 则需要删除db中查出的所有的
                return nftFromDb;
            } else {
                let nftList: INftEntities[] = [];
                nftFromDb.forEach((nfd) => {
                    if (nftFromLcd.every((nfl) => nfd.nft_id !== nfl.value.id)) {
                        nftList.push(nfd);
                    }
                });
                return nftList;
            }
        }
    }

    private static getShouldInsertList(nftFromLcd: any[], nftFromDb: INftEntities[]): any[] {
        if (nftFromDb.length === 0) {
            return nftFromLcd ? nftFromLcd : [];
        } else {
            if (nftFromLcd.length === 0) {
                return [];
            } else {
                let nftList: any[] = [];
                nftFromLcd.forEach((nfd) => {
                    if (nftFromDb.every((nfl) => nfl.nft_id !== nfd.value.id)) {
                        nftList.push(nfd);
                    }
                });
                return nftList;
            }
        }
    }

    private static getShouldUpdateList(nftFromLcd: any[], nftFromDb: INftEntities[]): any[] {
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
            if (nftFromLcd.length === 0) {
                return [];
            } else {
                let nftList: any[] = [];
                nftFromDb.forEach((nfd) => {
                    nftFromLcd.forEach((nfl) => {
                        if (nfl.value.id === nfd.nft_id) {
                            //compare difference by hash;
                            const lcdStr = `${nfl.value.owner}${nfl.value.token_uri ? nfl.value.token_uri : ''}${nfl.value.token_data ? nfl.value.token_data : ''}`;
                            const lcdHash = md5(lcdStr);
                            nfl.hash = lcdHash;
                            if (lcdHash !== nfd.hash) {
                                nftList.push(nfl);
                            }
                        }
                    });
                });
                return nftList;
            }
        }
    }


}

