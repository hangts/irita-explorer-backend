import * as mongoose from 'mongoose';
import { ListStruct } from '../types';
import { ITxsWithDdcQuery } from '../types/schemaTypes/tx.interface';
import { dbRes } from '../helper/txEvm.helper';
import { queryTxWithDdcHelper } from '../helper/params.helper';
import {ITxEvmStruct} from "../types/schemaTypes/tx.evm.interface";

export const TxEvmSchema = new mongoose.Schema({
  time: Number,
  height: Number,
  tx_hash: String,
  evm_tx_hash: String,
  memo: String,
  status: Number,
  types: Array,
  signers: Array,
  fee: Object,
  evm_datas: Array,
  contract_address: String,
  create_time: Number,
  update_time: Number,
  is_deploy: Number,
}, { versionKey: false });


TxEvmSchema.statics = {
  async findList(
    pageNum: number,
    pageSize: number,
    contractAddr?: string,
    ddcId?: string,
  ): Promise<ListStruct> {
    const result: ListStruct = {};

    const queryParameters: any = {};
    if (contractAddr || ddcId) {
      if (contractAddr) queryParameters.evm_datas.contract_address = contractAddr;
      if (ddcId) queryParameters.ex_ddc_infos.ddc_id = ddcId;
    }

    result.data = await this.find(queryParameters)
      .sort({ height: -1 })
      .skip((Number(pageNum) - 1) * Number(pageSize))
      .limit(Number(pageSize));

    return result;
  },

  async findEvmTxsByHashes(txHashs: string[]): Promise<ITxEvmStruct[]> {
    return await this.find({ tx_hash: {$in:txHashs } });
  },

  async queryTxWithDdc(query: ITxsWithDdcQuery): Promise<ListStruct> {
    const result: ListStruct = {};
    const queryParameters = queryTxWithDdcHelper(query)
    result.data = await this.find(queryParameters, dbRes.txDdcList)
      .sort({ height: -1 })
      .skip((Number(query.pageNum) - 1) * Number(query.pageSize))
      .limit(Number(query.pageSize));
    return result;
  },
  async queryTxWithDdcCount(query: ITxsWithDdcQuery): Promise<number> {
    const queryParameters = queryTxWithDdcHelper(query)
    return await this.find(queryParameters).countDocuments();
  },

};