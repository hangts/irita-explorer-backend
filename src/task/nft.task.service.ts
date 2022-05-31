import { Injectable, } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { NftHttp } from '../http/lcd/nft.http';
import { INft, INftStruct } from '../types/schemaTypes/nft.interface';
import { IDenom, IDenomStruct } from '../types/schemaTypes/denom.interface';
import md5 from 'blueimp-md5';
import { getTimestamp } from '../util/util';
import { ILcdNftStruct } from '../types/task.interface';
import { ITxStruct } from '../types/schemaTypes/tx.interface';
import { INCREASE_HEIGHT, MAX_OPERATE_TX_COUNT, NFT_INFO_DO_NOT_MODIFY, TaskEnum, TxType } from '../constant';
import {Logger} from '../logger'
import { IRandomKey } from '../types';
import { taskLoggerHelper } from '../helper/task.log.helper';
import { getTaskStatus } from '../helper/task.helper'
@Injectable()
export class NftTaskService {
    constructor(@InjectModel('Nft') private nftModel: Model<INft>,
                @InjectModel('Tx') private txModel: any,
                @InjectModel('Denom') private denomModel: any,
                @InjectModel('SyncTask') private taskModel: any,
    ) {
        this.doTask = this.doTask.bind(this);
    }

    async doTask(taskName?: TaskEnum, randomKey?: IRandomKey): Promise<void> {
        let status: boolean = await getTaskStatus(this.taskModel,taskName)
        if (!status) {
            return
        }
        taskLoggerHelper(`${taskName}: start to execute task`, randomKey);
        const nftList: INftStruct[] = await (this.nftModel as any).queryLastBlockHeight();
        taskLoggerHelper(`${taskName}: execute task (step should be start step + 1)`, randomKey);
        let lastBlockHeight = 0;
        if (nftList && nftList.length > 0) {
            lastBlockHeight = nftList[0].last_block_height || 0;
        }
        //查询最高区块, 当递加的高度超过最大交易height的时候, 需要停止查询
        let maxHeight = 0;
        const txList = await (this.txModel as any).queryMaxNftTxList();
        taskLoggerHelper(`${taskName}: execute task (step should be start step + 2)`, randomKey);
        if (txList && txList.length > 0 && txList[0].height > 0) {
            maxHeight = txList[0].height;
        } else {
            //如果高度未查出, 会出现超出tx高度以后一直递加查询仍然达不到 所需要的交易的数量, 会陷入死循环, 需要直接抛出错误
            throw 'the max height of nft tx has not been queried!';
        }

        let nftTxList: ITxStruct[] = await this.getNftTxList(lastBlockHeight, maxHeight);
        taskLoggerHelper(`${taskName}: execute task (step should be start step + 3)`, randomKey);
        if (nftTxList && nftTxList.length > 0) {
            const denomList: IDenomStruct[] = await (this.denomModel as any).findList(0, 0, '', 'true');
            let denomMap = new Map<string, string>();
            if (denomList && denomList.length > 0) {
                denomList.forEach((denom: IDenomStruct) => {
                    denomMap.set(denom.denom_id, denom.name);
                });
            }
            taskLoggerHelper(`${taskName}: execute task (step should be start step + 4)`, randomKey);
            await this.handleNftTx(nftTxList, denomMap);
        }
        taskLoggerHelper(`${taskName}: end to execute task (step should be start step + 4 or 5)`, randomKey);
    }

    async getNftTxList(lastBlockHeight: number, maxHeight: number): Promise<ITxStruct[]> {

        let list: any[] = [];
        const querynftTxList = async (lastBlockHeight: number) => {
            const nftTxList: ITxStruct[] = await this.queryNftTxList(lastBlockHeight);
            list = list.concat(nftTxList);
            Logger.log(`ex_sync_nft lastBlockHeight: ${lastBlockHeight}, tx count ${list.length}`);
             /*
                1. 高度未达到, tx.length未达到, 查询
                2. 高度未达到, tx.length已达到, 不查询
                3. 高度已达到, tx.length未达到, 不查询
                4. 高度已达到, tx.length已达到, 不查询
             */
            //表查询条件是   lastBlockHeight < cond <= lastBlockHeight+INCREASE_HEIGHT, 所以下面判断需要先 + INCREASE_HEIGHT;
            lastBlockHeight += INCREASE_HEIGHT;
            if (lastBlockHeight < maxHeight && list.length < MAX_OPERATE_TX_COUNT) {
                await querynftTxList(lastBlockHeight);
            }
        };
        if(lastBlockHeight < maxHeight){
            //只有当nft表中的高度落后的时候才执行
            await querynftTxList(lastBlockHeight);
        }


        return list;
    }

    async queryNftTxList(lastBlockHeight: number): Promise<ITxStruct[]> {
        return await (this.txModel as any).queryNftTxList(lastBlockHeight);
    }

    async handleNftTx(nftTxList: ITxStruct[], denomMap: Map<string, string>): Promise<void> {
        const promiseList: Promise<any>[] = [];
        const nftObj = {};
        let last_block_height = 0;
        nftTxList.forEach((tx) => {
            const { msg } = (tx.msgs as any);
            const idStr = `${msg.denom}-${msg.id}`;
            if (!nftObj[idStr]) nftObj[idStr] = {};
            if ((tx.msgs as any).type === TxType.mint_nft) {
                nftObj[idStr].denom_name = denomMap.get(msg.denom);
                nftObj[idStr].nft_name = msg.name;
                nftObj[idStr].owner = msg.recipient;//mint_nft如果传一个recipient参数, 那么这个nft的owner就被转移到此地址下
                nftObj[idStr].uri = msg.uri;
                nftObj[idStr].data = msg.data;
                nftObj[idStr].is_deleted = false;
                nftObj[idStr].create_time = getTimestamp();
            } else if ((tx.msgs as any).type === TxType.edit_nft) {
                if(msg.name !== NFT_INFO_DO_NOT_MODIFY){
                    nftObj[idStr].nft_name = msg.name;
                }
                if(msg.uri !== NFT_INFO_DO_NOT_MODIFY){
                    nftObj[idStr].uri = msg.uri;
                }
                if(msg.data !== NFT_INFO_DO_NOT_MODIFY){
                    nftObj[idStr].data = msg.data;
                }
            } else if ((tx.msgs as any).type === TxType.transfer_nft) {
                nftObj[idStr].owner = msg.recipient;
                //转让的时候, 可以对可编辑的信息重新赋值
                if(msg.name !== NFT_INFO_DO_NOT_MODIFY){
                    nftObj[idStr].nft_name = msg.name;
                }
                if(msg.uri !== NFT_INFO_DO_NOT_MODIFY){
                    nftObj[idStr].uri = msg.uri;
                }
                if(msg.data !== NFT_INFO_DO_NOT_MODIFY){
                    nftObj[idStr].data = msg.data;
                }
            } else if ((tx.msgs as any).type === TxType.burn_nft) {
                nftObj[idStr].is_deleted = true;
            }
            nftObj[idStr].denom_id = msg.denom;
            nftObj[idStr].nft_id = msg.id;
            nftObj[idStr].last_block_height = tx.height;
            nftObj[idStr].last_block_time = tx.time;
            nftObj[idStr].update_time = getTimestamp();
            last_block_height = Math.max(tx.height,last_block_height);
        });

        for (let idStr in nftObj) {
            if (nftObj[idStr].is_deleted) {
                delete nftObj[idStr].is_deleted;
                promiseList.push((this.nftModel as any).deleteNft(nftObj[idStr]));
            } else {
                promiseList.push((this.nftModel as any).updateNft(nftObj[idStr]));
            }
        }
        await Promise.all(promiseList);
        if(last_block_height){
            let lastNft =  await (this.nftModel as any).queryLastNft();
            if(lastNft.last_block_height < last_block_height){
                lastNft.last_block_height = last_block_height;
                await (this.nftModel as any).updateNft(lastNft);
            }
        }
    }
}

