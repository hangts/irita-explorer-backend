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
                @InjectModel('Tx') private txModel: any,
                private readonly nftHttp: NftHttp,
    ) {
        this.doTask = this.doTask.bind(this);
    }

    async doTask(): Promise<void> {
        // 从数据库 ex_sync_denom 表中查询所有的 [{ denom_id: '' , name : ''}]
        const denomList: IDenomStruct[] = await (this.denomModel as any).findAllNames();
        if (denomList && denomList.length > 0) {
            for (let denom of denomList) {
                // 通过lcd查询 http://192.168.150.31:11317/nft/nfts/collections/:denom_id 获取相关信息
                const res: any = await this.nftHttp.queryNftsFromLcdByDenom(denom.denom_id);
                // 从 数据库 ex_sync_nft 表中通过denom_id查询数据库中的数据 
                const nftFromDb: INftStruct[] = await (this.nftModel as any).findListByName(denom.denom_id);
                if (res) {
                    let lcdNftMap: Map<string, ILcdNftStruct> | null = new Map<string, ILcdNftStruct>(),
                        dbNftMap: Map<string, INftStruct> | null = new Map<string, INftStruct>();
                    if (res.nfts && Array.isArray(res.nfts) && res.nfts.length > 0) {
                        for (let nft of res.nfts) {
                            nft.denom_id = res.denom.id;
                            nft.denom_name = res.denom.name;
                            let time = await this.txModel.queryTxByDenomIdAndNftId(nft.id, res.denom.id);
                            nft.time = time && time[0] && time[0].time
                            lcdNftMap.set(NftTaskService.getNftKey({ nft_id: nft.id, denom_id: res.denom.id }), nft);
                        }
                    } else {
                        lcdNftMap = null;
                    }

                    if (nftFromDb.length > 0) {
                        nftFromDb.forEach((nft: INftStruct) => {
                            dbNftMap.set(NftTaskService.getNftKey(nft), nft);
                        });
                    } else {
                        dbNftMap = null;
                    }
                    let shouldInsertMap: Map<string, ILcdNftStruct> = NftTaskService.getShouldInsertList(lcdNftMap, dbNftMap);
                    let shouldDeleteNftMap: Map<string, INftStruct> = NftTaskService.getShouldDeleteList(lcdNftMap, dbNftMap);
                    let shouldUpdateNftMap: Map<string, ILcdNftStruct> = NftTaskService.getShouldUpdateList(lcdNftMap, dbNftMap);
                    await this.saveNft(denom.denom_id, denom.name, shouldInsertMap);
                    await this.deleteNft(denom.denom_id, shouldDeleteNftMap);
                    await this.updateNft(denom.denom_id,denom.name, shouldUpdateNftMap);
                }
            }
        }
    }

    private async saveNft(denomId: string, denomName: string, shouldInsertMap: Map<string, ILcdNftStruct>): Promise<void> {
        if (shouldInsertMap && shouldInsertMap.size > 0) {
            let insertNftList: INftStruct[] = Array.from(shouldInsertMap.values()).map((nft) => {
                const { owner, uri, data, id, name, time } = nft;
                const str: string = `${name}${owner}${uri ? uri : ''}${data ? data : ''}`,
                    hash = md5(str);
                return {
                    denom_id: denomId,
                    denom_name: denomName || '',
                    nft_id: id,
                    nft_name: name,
                    owner: owner,
                    uri: uri ? uri : '',
                    data: data ? data : '',
                    create_time: getTimestamp(),
                    update_time: getTimestamp(),
                    hash,
                    time
                };
            });
            await (this.nftModel as any).saveBulk(insertNftList);
        }
    }

    private async deleteNft(denomId: string, shouldDeleteNftMap: Map<string, INftStruct>): Promise<void> {
        if (shouldDeleteNftMap && shouldDeleteNftMap.size > 0) {
            for(let nft of Array.from(shouldDeleteNftMap.values())){
                await (this.nftModel as any).deleteOneByDenomAndId({
                    nft_id: nft.nft_id,
                    denom_id: denomId,
                });
            }
        }
    }

    private async updateNft(denomId: string, denomName: string,shouldUpdateNftMap: Map<string, ILcdNftStruct>): Promise<void> {
        if (shouldUpdateNftMap && shouldUpdateNftMap.size > 0) {
            for(let nft of Array.from(shouldUpdateNftMap.values())){
                const { id, owner, uri, data, hash, name,time } = nft;
                const nftEntity: INftStruct = {
                    nft_id: id,
                    nft_name: name,
                    owner: owner,
                    uri: uri,
                    data: data,
                    hash: hash,
                    denom_id: denomId,
                    denom_name: denomName || '',
                    time
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
                for (let nft_db of nftFromDb.values()) {
                    let nftKey = NftTaskService.getNftKey({denom_id:nft_db.denom_id,nft_id:nft_db.nft_id});
                    if (!nftFromLcd.has(nftKey)) {
                        deleteNftMap.set(nftKey, nft_db);
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
                for (let nft_lcd of nftFromLcd.values()) {
                    let nftKey = NftTaskService.getNftKey({denom_id:nft_lcd.denom_id,nft_id:nft_lcd.id});
                    if (!nftFromDb.has(nftKey)) {
                        insertNftMap.set(nftKey, nft_lcd);
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
                for (let nft_lcd of nftFromLcd.values()) {
                    let nftKey = NftTaskService.getNftKey({denom_id:nft_lcd.denom_id,nft_id:nft_lcd.id});
                    if (nftFromDb.has(nftKey)) {
                        const { name, owner, data, uri, denom_name } = nft_lcd,
                            lcdStr = `${name}${denom_name}${owner}${uri ? uri : ''}${data ? data : ''}`,
                            lcdHash = md5(lcdStr);
                        if (nftFromDb.get(nftKey).hash !== lcdHash) {
                            let tempLcdNft: ILcdNftStruct = nft_lcd;
                            tempLcdNft.hash = lcdHash;
                            updateNftMap.set(nftKey, tempLcdNft);
                        }
                    }
                }
                return updateNftMap;
            }
        }
    }

    private static getNftKey(nft:INftStruct): string {
        return `${nft.denom_id}#${nft.nft_id}`;
    }
}

