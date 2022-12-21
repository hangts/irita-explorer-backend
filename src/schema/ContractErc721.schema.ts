import * as mongoose from 'mongoose';
import {IContractErc721Struct} from "../types/schemaTypes/contracterc721.interface";

export const ContractErc721Schema = new mongoose.Schema({
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

ContractErc721Schema.statics = {
  /*async findOneByDenomId(denomId: string): Promise<IContractErc20Struct> {
    return await this.findOne({denom_id: denomId});
  },*/

  async findListInContractAddrs(addrs: string[]): Promise<IContractErc721Struct[]> {
    return await this.find({contract_addr: {'$in': addrs}});
  },
};

