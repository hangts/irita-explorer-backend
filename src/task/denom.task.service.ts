import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { DenomHttp } from '../http/lcd/denom.http';
import {IDenom, IDenomStruct, IDenomMsgStruct, ITransferDenomMsgStruct} from '../types/schemaTypes/denom.interface';
import { ITxStruct } from '../types/schemaTypes/tx.interface';
import {TaskEnum, TxType} from '../constant';
import { getTaskStatus } from '../helper/task.helper';
import {getTimestamp} from '../util/util';

@Injectable()
export class DenomTaskService {
    constructor(
        @InjectModel('Denom') private denomModel: Model<IDenom>,
        @InjectModel('Tx') private txModel: any,
        @InjectModel('SyncTask') private taskModel: any,
        private readonly denomHttp: DenomHttp
    ) {
        this.doTask = this.doTask.bind(this);
    }

    async doTask(taskName?: TaskEnum): Promise<void> {
        let status: boolean = await getTaskStatus(this.taskModel,taskName)
        if (!status) {
            return
        }
        const denomList: IDenomStruct[] = await (this.denomModel as any).findLastBlockHeight();
        let lastBlockHeight = 0;
        if (denomList && denomList.length > 0) {
            lastBlockHeight = denomList[0].last_block_height || 0;
        }
        let maxHeight = 0;
        const txList = await (this.txModel as any).queryMaxDenomTxList();
        if (txList && txList.length > 0 && txList[0].height > 0) {
            maxHeight = txList[0].height;
        }
        if (lastBlockHeight < maxHeight) {
            const denomTxList: ITxStruct[] = await (this.txModel as any).queryDenomTxList(lastBlockHeight);
            if (denomTxList && denomTxList.length > 0) {
                // let addDenom = denomTxList.map(denom => {
                //     let msg:IDenomMsgStruct = denom.msgs[0]['msg']
                //     return {
                //         name: msg && msg.name,
                //         denom_id: msg && msg.id,
                //         json_schema: msg && msg.schema,
                //         creator: msg && msg.sender,
                //         owner: msg && msg.sender,
                //         tx_hash: denom.tx_hash,
                //         height: denom.height,
                //         time: denom.time,
                //         create_time: getTimestamp(),
                //         last_block_height: denom.height,
                //         last_block_time: denom.time,
                //     }
                // })
                let addDenom = []
                let promiseList: Promise<any>[] = [];
                for (const tx of denomTxList) {
                    if (tx.msgs.length) {
                        for (const item of tx.msgs) {
                            switch ((item as any).type) {
                                case TxType.issue_denom:
                                        const msg:IDenomMsgStruct = (item as any).msg
                                        const denom = {
                                            name: msg && msg.name,
                                            denom_id: msg && msg.id,
                                            json_schema: msg && msg.schema,
                                            creator: msg && msg.sender,
                                            owner: msg && msg.sender,
                                            tx_hash: tx.tx_hash,
                                            height: tx.height,
                                            time: tx.time,
                                            create_time: getTimestamp(),
                                            last_block_height: tx.height,
                                            last_block_time: tx.time,
                                        }
                                        addDenom.push(denom)
                                    break;
                                case TxType.transfer_denom:
                                    const transfrDenom: ITransferDenomMsgStruct = (item as any).msg
                                    const denomId = transfrDenom?.id;
                                    const newOwner = transfrDenom?.recipient;
                                    promiseList.push((this.denomModel as any).updateDenomOwner(denomId, newOwner,tx.height,tx.time));
                                    break;
                            }
                        }
                    }
                }
                await (this.denomModel as any).insertManyDenom(addDenom);
                if (promiseList.length) {
                    await Promise.all(promiseList);
                }
            }
        }
    }
}

