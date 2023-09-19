import * as mongoose from 'mongoose';
import {IContractErc1155Struct} from "../types/schemaTypes/contracterc1155.interface";

export const ContractErc1155Schema = new mongoose.Schema({
  symbol: String,
  name: String,
  contract_addr: String,
  creator_contract_addr: String,
  holders: Number,
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

ContractErc1155Schema.statics = {

  async findListInContractAddrs(addrs: string[]): Promise<IContractErc1155Struct[]> {
    return await this.find({contract_addr: {'$in': addrs}});
  },
};

