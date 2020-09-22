import * as mongoose from 'mongoose';
import {Logger} from "../logger";
import {IListStruct} from "../types";
import {IStakingValidator} from "../types/schemaTypes/staking.validator.interface";

export const StakingValidatorSchema = new mongoose.Schema({
    operator_address: String,
    consensus_pubkey: String,
    jailed: Boolean,
    status: Number,
    tokens: String,
    delegator_shares: String,
    description: Object,
    bond_height: String,
    unbonding_height: String,
    unbonding_time: String,
    commission: Object,
    uptime: Number,
    self_bond: Object,
    delegator_num: Number,
    proposer_addr: String,
    voting_power: Number,
    min_self_delegation: Number,
    icons: String,
    start_height: String,
    index_offset: String,
    jailed_until: String,
    tombstoned: Boolean,
    missed_blocks_counter: Boolean,
    create_time: Number,
    update_time: Number,
})
StakingValidatorSchema.index({operator_address: 1}, {unique: true})

StakingValidatorSchema.statics = {

    async queryAllValidators() {
        return await this.find({})
    },

    async findValidatorByPropopserAddr(PropopserAddr:string):Promise<IStakingValidator>{
        return await this.find({proposer_addr:PropopserAddr});
    },

    async insertValidator(insertValidator:IStakingValidator) {
        let {operator_address} = insertValidator
        //设置 options 查询不到就插入操作
        const options = {upsert: true, new: false, setDefaultsOnInsert: true}
        await this.findOneAndUpdate({operator_address}, insertValidator, options)
    },

    async deleteValidator(deleteValidator:IStakingValidator) {
        const {operator_address} = deleteValidator
        await this.deleteOne({operator_address})
    },
    async queryAllValCommission(query): Promise<IListStruct> {
        const result: IListStruct = {}
        if (query.useCount && query.useCount == true) {
            result.count = await this.find({}).countDocuments();
        }
        result.data = await this.find({}).select({'_id': 0, '__v': 0})
        return result
    }
}