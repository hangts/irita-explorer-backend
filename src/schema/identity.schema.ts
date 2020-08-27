import * as mongoose from 'mongoose';

import { ITXWithIdentity } from '../types/schemaTypes/tx.interface'
import { IListStruct } from '../types';
import { IIdentity } from '../types/tx.interface';

export const IdentitySchema  = new mongoose.Schema({
  id: String,
  owner: String,
  pubkeys: Array,
  certificates: Array,
  credentials: String,
})

IdentitySchema.statics.queryTxIdentityList = async function(query: ITXWithIdentity):Promise<IListStruct> {
  const result: IListStruct = {}
  const queryParameters: any = {};
  if(query.search && query.search !== ''){
    //单条件模糊查询使用$regex $options为'i' 不区分大小写
    queryParameters.$or = [
      {id:{ $regex: query.search,$options:'i' }},
      {owner:{ $regex: query.search,$options:'i' }}
      ]
    result.data = await  this.find(queryParameters)
      .skip((Number(query.pageNum) - 1) * Number(query.pageSize))
      .limit(Number(query.pageSize));
  }else {
    result.data = await  this.find().skip((Number(query.pageNum) - 1) * Number(query.pageSize))
      .limit(Number(query.pageSize))
  }
  if (query.useCount && query.useCount == true) {
    result.count = await this.find(queryParameters).countDocuments();
  }
  return result;
}
