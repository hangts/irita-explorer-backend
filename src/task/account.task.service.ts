import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from "mongoose";
import { getTimestamp} from '../util/util';
import { cfg } from "../config/config";
import { getTaskStatus } from '../helper/task.helper';
import { IRandomKey } from '../types';
import { TaskEnum } from '../constant';
import { IAccountStruct } from '../types/schemaTypes/account.interface';
import { INCREASE_HEIGHT,addressAccount } from '../constant';
@Injectable()
export class AccountTaskService {
    constructor(
        @InjectModel('Tx') private txModel: any,
        @InjectModel('SyncTask') private taskModel: any,
        @InjectModel('Account') private accountModel: any
    ) {
        this.doTask = this.doTask.bind(this);
    }
    async doTask(taskName?: TaskEnum, randomKey?: IRandomKey): Promise<void> {
        let status: boolean = await getTaskStatus(this.taskModel,taskName)
        if (!status) {
            return
        }
        const accountList:IAccountStruct[] = await (this.accountModel as any).queryHandledBlockHeight();
        let handledBlockHeight = 0;
        if (accountList && accountList.length > 0) {
            handledBlockHeight = accountList[0].handled_block_height || 0;
        }
        const txList = await (this.txModel as any).queryAccountTxList(handledBlockHeight);
        let addressSet = new Set();
        let handled_block_height: number = handledBlockHeight + INCREASE_HEIGHT;
        if (txList && txList.length > 0) {
            txList.forEach(tx => {
                if (tx.addrs && tx.addrs.length > 0) {
                    tx.addrs.forEach(address => {
                        addressSet.add(address)
                    });
                }
            });
            handled_block_height = txList[txList.length - 1].height;
        }
        if (addressSet.size > 0) {
            let addAccount: IAccountStruct[] = [...addressSet].map(address => {
                return {
                    address: address as string,
                    account_total: 0,
                    total: {},
                    balance: [],
                    delegation: {},
                    unbonding_delegation: {},
                    rewards: {},
                    create_time: getTimestamp(),
                    update_time: 0,
                    handled_block_height,
                }
            })
            try {
                await (this.accountModel as any).insertManyAccount(addAccount);
            } catch (e) {
                if (e.name !== 'BulkWriteError') {
                    throw e;
                }
            }
        }
        await (this.accountModel as any).updateAccount({
            address: addressAccount,
            account_total: 0,
            total: {},
            balance: [],
            delegation: {},
            unbonding_delegation: {},
            rewards: {},
            create_time: getTimestamp(),
            update_time: 0,
            handled_block_height
        });
    }
}
