import * as mongoose from 'mongoose';
import { ListStruct } from '../types';
import {
  IDdcTxEvmStruct,
} from '../types/schemaTypes/ddc.tx.evm.interface';
import { ITxsWithAddressQuery, ITxsWithDdcQuery } from '../types/schemaTypes/tx.interface';
import { dbRes } from '../helper/txEvm.helper';
import { queryTxWithDdcHelper } from '../helper/params.helper';

export const TxEvmSchema = new mongoose.Schema({
  time: Number,
  height: Number,
  tx_hash: String,
  memo: String,
  status: Number,
  types: Array,
  signers: Array,
  fee: Object,
  evm_datas: Array,
  ex_ddc_infos: Array,
  create_time: Number,
  update_time: Number,
}, { versionKey: false });

// 新增
// TxEvmSchema.index({ 'evm_datas.contract_address': -1 }, { background: true });
TxEvmSchema.index({ 'ex_ddc_infos.ddc_id': -1,'ex_ddc_infos.ddc_type': -1 }, { background: true });
// TxEvmSchema.index({ 'ex_ddc_infos.sender': -1,status:-1}, { background: true });
// TxEvmSchema.index({ 'ex_ddc_infos.recipient': -1,status:-1}, { background: true });
TxEvmSchema.index({ 'tx_hash': -1 }, { background: true });

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

  async findEvmTxsByHashes(txHashs: string[]): Promise<IDdcTxEvmStruct[]> {
    return await this.find({ tx_hash: {$in:txHashs } });
  },
  // async findEvmTxsByContractAddrDdcId(contractAddr: string, ddcId: string): Promise<IDdcTxEvmStruct[]> {
  //   return await this.find({ 'evm_datas.contract_address': contractAddr, 'ex_ddc_infos.ddc_id': ddcId })
  // },
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

  async findAllContractAddr() {
    const matchContractAddr = {
      $match: {
        'types': 'ethereum_tx'
      }
    }
    const unwind = {
      $unwind: '$evm_datas'
    }
    const group = {
      $group: {
        _id: '$evm_datas.contract_address'
      },
    }
    return  await this.aggregate([matchContractAddr,unwind,group])
  },

  // async queryTxWithDdcAddr(query: ITxsWithAddressQuery): Promise<ListStruct> {
  //   const result: ListStruct = {};
  //   const queryParameters = queryTxWithDdcAddrHelper(query)
  //   result.data = await this.find(queryParameters, dbRes.txDdcList)
  //       .sort({ height: -1 })
  //       .skip((Number(query.pageNum) - 1) * Number(query.pageSize))
  //       .limit(Number(query.pageSize));
  //   return result;
  // },
  // async queryTxWithDdcAddrCount(query: ITxsWithAddressQuery): Promise<number> {
  //   const queryParameters = queryTxWithDdcAddrHelper(query)
  //   return await this.find(queryParameters).countDocuments();
  // }

};