import * as mongoose from 'mongoose';
import { Logger } from '../logger';
import {
  IDdcStruct,
} from '../types/schemaTypes/ddc.interface';
import { ListStruct } from '../types';
import {
  findDdcListHelper,
} from '../helper/params.helper';

export const DdcSchema = new mongoose.Schema({
  ddc_id: Number,
  ddc_type: Number,
  ddc_name: String,
  ddc_symbol: String,
  ddc_uri: String,
  ddc_data: String,
  contract_address: String,
  owner: String,
  creator: String,
  amount: Number,
  latest_tx_height: Number,
  latest_tx_time: Number,
  is_delete: Boolean,
  is_freeze: Boolean,
  create_time: Number,
  update_time: Number
}, { versionKey: false });

// 新增
//DdcSchema.index({ latest_tx_height: 1, contract_address: 1, ddc_id: 1 }, { background: true });
//DdcSchema.index({ owner: 1, latest_tx_height: -1 }, { background: true });
//DdcSchema.index({ ddc_id: 1, latest_tx_height: -1 }, { background: true });
//DdcSchema.index({ ddc_name: 1, latest_tx_height: -1 }, { background: true });

DdcSchema.statics = {
  async findList(
    pageNum: number,
    pageSize: number,
    contractAddr?: string,
    ddcId?: string,
    owner?: string,
    ddcType?: number,
  ): Promise<ListStruct> {
    const result: ListStruct = {};

    const queryParameters = findDdcListHelper(contractAddr, ddcId, owner, ddcType);
    result.data = await this.find(queryParameters)
      .sort({ latest_tx_height: -1 })
      .skip((Number(pageNum) - 1) * Number(pageSize))
      .limit(Number(pageSize));

    return result;
  },
  async findDdcListCount(contractAddr?: string, ddcId?: string, owner?: string, ddcType?: number): Promise<number> {
    const params = findDdcListHelper(contractAddr, ddcId, owner, ddcType);
    return await this.find(params).countDocuments();
  },

  async findOneByContractAddrAndDdcId(contractAddr: string, ddcId: string): Promise<IDdcStruct | null> {
    return await this.findOne({ contract_address: contractAddr, ddc_id: ddcId });
  },



};