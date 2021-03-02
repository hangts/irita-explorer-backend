import * as mongoose from 'mongoose';
import {
    IAccountStruct,
} from '../types/schemaTypes/account.interface';

export const AccountSchema = new mongoose.Schema({
    address: String,
    account_total: Number,
    total: Object,
    balance: Object,
    delegation: Object,
    unbonding_delegation: Object,
    rewards: Object,
    create_time: Number,
    update_time: Number,
    handled_block_height: Number,
})
AccountSchema.index({ address: 1 }, { unique: true });
AccountSchema.index({ account_total: -1 }, { background: true });
AccountSchema.index({ handled_block_height: -1 }, { background: true });

AccountSchema.statics = {
    async queryHandledBlockHeight(): Promise<IAccountStruct>{
        return await this.find({},{handled_block_height: 1,address: 1}).sort({handled_block_height: -1}).limit(1);
    },
    async insertManyAccount(AccountList): Promise<IAccountStruct[]>{
        return await this.insertMany(AccountList, { ordered: false })
    },
    async updateAccount(account:IAccountStruct) {
        let { address } = account
        const options = {upsert: true, new: false, setDefaultsOnInsert: true}
        await this.findOneAndUpdate({address}, account, options)
    },
    async queryAllAddress(): Promise<IAccountStruct>{
        return await this.find({}, {address:1,_id:0});
    },
}
