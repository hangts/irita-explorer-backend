import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { NftHttp } from '../http/lcd/nft.http';
import { INft, INftStruct } from '../types/schemaTypes/nft.interface';
import { IDenom, IDenomStruct } from '../types/schemaTypes/denom.interface';
import md5 from 'blueimp-md5';
import { getTimestamp } from '../util/util';
import { ILcdNftStruct } from '../types/task.interface';

@Injectable()
export class NftTaskService {
    constructor(@InjectModel('Nft') private nftModel: Model<INft>,
                @InjectModel('Denom') private denomModel: Model<IDenom>,
                private readonly nftHttp: NftHttp,
    ) {
        this.doTask = this.doTask.bind(this);
    }

    async doTask(): Promise<void> {
        const denomList: IDenomStruct[] = await (this.denomModel as any).findAllNames();
        if (denomList && denomList.length > 0) {
            for(let denom of denomList){
                const res: any = await this.nftHttp.queryNftsFromLcdByDenom(denom.name);
                const nftFromDb: INftStruct[] = await (this.nftModel as any).findListByName(denom.name);
                if (res) {
                    let lcdNftMap: Map<string, ILcdNftStruct> | null = new Map<string, ILcdNftStruct>(),
                        dbNftMap: Map<string, INftStruct> | null = new Map<string, INftStruct>();
                    if (res.nfts && Array.isArray(res.nfts) && res.nfts.length > 0) {
                        res.nfts.forEach(nft => {
                            lcdNftMap.set(nft.value.id, nft.value);
                        });
                    } else {
                        lcdNftMap = null;
                    }

                    if (nftFromDb.length > 0) {
                        nftFromDb.forEach((nft: INftStruct) => {
                            dbNftMap.set(nft.nft_id, nft);
                        });
                    } else {
                        dbNftMap = null;
                    }

                    let shouldInsertMap: Map<string, ILcdNftStruct> = NftTaskService.getShouldInsertList(lcdNftMap, dbNftMap);
                    let shouldDeleteNftMap: Map<string, INftStruct> = NftTaskService.getShouldDeleteList(lcdNftMap, dbNftMap);
                    let shouldUpdateNftMap: Map<string, ILcdNftStruct> = NftTaskService.getShouldUpdateList(lcdNftMap, dbNftMap);
                    await this.saveNft(denom.name, shouldInsertMap);
                    await this.deleteNft(denom.name, shouldDeleteNftMap);
                    await this.updateNft(denom.name, shouldUpdateNftMap);
                }
            }

        }
    }

    private async saveNft(name: string, shouldInsertMap: Map<string, ILcdNftStruct>): Promise<void> {
        if (shouldInsertMap && shouldInsertMap.size > 0) {
            let insertNftList: INftStruct[] = Array.from(shouldInsertMap.values()).map((nft) => {
                const { owner, token_uri, token_data, id } = nft;
                const str: string = `${owner}${token_uri ? token_uri : ''}${token_data ? token_data : ''}`,
                    hash = md5(str);
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
            await (this.nftModel as any).saveBulk(insertNftList);
        }
    }

    private async deleteNft(name: string, shouldDeleteNftMap: Map<string, INftStruct>): Promise<void> {
        if (shouldDeleteNftMap && shouldDeleteNftMap.size > 0) {
            for(let nft of Array.from(shouldDeleteNftMap.values())){
                await (this.nftModel as any).deleteOneByDenomAndId({
                    nft_id: nft.nft_id,
                    denom: name,
                });
            }
        }
    }

    private async updateNft(name: string, shouldUpdateNftMap: Map<string, ILcdNftStruct>): Promise<void> {
        if (shouldUpdateNftMap && shouldUpdateNftMap.size > 0) {
            for(let nft of Array.from(shouldUpdateNftMap.values())){
                const { id, owner, token_uri, token_data, hash } = nft;
                const nftEntity: INftStruct = {
                    nft_id: id,
                    owner: owner,
                    token_uri: token_uri,
                    token_data: token_data,
                    hash: hash,
                    denom: name,
                };
                await (this.nftModel as any).updateOneById(nftEntity);
            }
        }
    }

    private static getShouldDeleteList(nftFromLcd: Map<string, ILcdNftStruct> | null, nftFromDb: Map<string, INftStruct> | null): Map<string, INftStruct> {
        if (!nftFromDb) {
            //如果db中已经没有nft, 则不需要执行delete操作
            return new Map<string, INftStruct>();
        } else {
            if (!nftFromLcd) {//如果从Lcd返回的Nft已经没有了, 则需要删除db中查出的所有的
                return nftFromDb;
            } else {
                const deleteNftMap = new Map<string, INftStruct>();
                for (let key of nftFromDb.keys()) {
                    if (!nftFromLcd.has(key)) {
                        deleteNftMap.set(key, nftFromDb.get(key));
                    }
                }
                return deleteNftMap;
            }
        }
    }

    private static getShouldInsertList(nftFromLcd: Map<string, ILcdNftStruct> | null, nftFromDb: Map<string, INftStruct> | null): Map<string, ILcdNftStruct> {
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

    private static getShouldUpdateList(nftFromLcd: Map<string, ILcdNftStruct> | null, nftFromDb: Map<string, INftStruct> | null): Map<string, ILcdNftStruct> {
        if (!nftFromDb) {
            return new Map<string, ILcdNftStruct>();
        } else {
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

