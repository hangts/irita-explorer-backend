import * as mongoose from 'mongoose';
import {IContractErc20Struct} from "../types/schemaTypes/contracterc20.interface";

export const ContractErc20Schema = new mongoose.Schema({
  symbol: String,
  name: String,
  contract_addr: String,
  creator_contract_addr: String,
  decimal: Number,
  total_supply: String,
  holders: Number,
  icon: String,
  transfer_transactions: Number,
  tx_hash: String,
  evm_tx_hash: String,
  height: Number,
  instantiated_time: Number,
  latest_tx_hash: String,
  latest_evm_tx_hash: String,
  latest_tx_height: String,
  latest_tx_time: String,
});

ContractErc20Schema.statics = {
  /*async findOneByDenomId(denomId: string): Promise<IContractErc20Struct> {
    return await this.findOne({denom_id: denomId});
  },*/

  async findListInContractAddrs(addrs: string[]): Promise<IContractErc20Struct[]> {
    return await this.find({contract_addr: {'$in': addrs}});
  },
};

