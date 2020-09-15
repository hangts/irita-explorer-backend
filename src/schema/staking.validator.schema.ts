import * as mongoose from 'mongoose';
import {IStakingValidator} from "../types/schemaTypes/staking.validator.interface";

export const StakingValidatorSchema = new mongoose.Schema({
  operator_address:String,
  consensus_pubkey:String,
  jailed:Boolean,
  status:Number,
  tokens:String,
  delegator_shares:String,
  description:Object,
  bond_height:String,
  unbonding_height:String,
  unbonding_time:String,
  commission:Object,
  uptime:Number,
  self_bond:String,
  delegator_num:Number,
  proposer_addr:String,
  voting_power:Number,
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
StakingValidatorSchema.index({operator_address: 1},{unique: true})

StakingValidatorSchema.statics = {

  async queryAllValidators():Promise<IStakingValidator[]> {
    return  await this.find({}).select({'_id':0,'__v':0})
  },

  async insertValidator(insertValidator) {
    const { operator_address } = insertValidator
    //设置 options 查询不到就插入操作
    const options = { upsert: true}
    await this.findOneAndUpdate({operator_address},insertValidator,options)
  }
}
