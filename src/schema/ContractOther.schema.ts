import * as mongoose from 'mongoose';
import {IContractOtherStruct} from "../types/schemaTypes/contractother.interface";

export const ContractOtherSchema = new mongoose.Schema({
  symbol: String,
  name: String,
  contract_addr: String,
  creator_contract_addr: String,
  transactions: Number,
  tx_hash: String,
  evm_tx_hash: String,
  height: Number,
  instantiated_time: Number,
  latest_tx_hash: String,
  latest_evm_tx_hash: String,
  latest_tx_height: String,
  latest_tx_time: String,
});

ContractOtherSchema.statics = {
  /*async findOneByDenomId(denomId: string): Promise<IContractErc20Struct> {
    return await this.findOne({denom_id: denomId});
  },*/

  async findListInContractAddrs(addrs: string[]): Promise<IContractOtherStruct[]> {
    return await this.find({contract_addr: {'$in': addrs}});
  },
};

