import * as mongoose from 'mongoose';
import {IMtDenomStruct} from "../types/schemaTypes/mt.interface";

export const MtDenomSchema = new mongoose.Schema({
  denom_name: String,
  denom_id: String,
  creator: String,
  owner: String,
  issue_tx_time: Number,
  issue_tx_height: Number,
  issue_tx_hash: String,
  latest_tx_time: Number,
  latest_tx_height: Number,
  latest_tx_hash: String,
});

MtDenomSchema.statics = {
  async findOneByDenomId(denomId: string): Promise<IMtDenomStruct> {
    return await this.findOne({denom_id: denomId});
  },

  async findListInDenomIds(denomId: string[]): Promise<IMtDenomStruct[]> {
    return await this.find({denom_id: {'$in': denomId}});
  },
};

