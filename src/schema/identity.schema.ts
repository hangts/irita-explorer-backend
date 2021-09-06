import * as mongoose from 'mongoose'
import { IIdentityInfoQuery,IIdentityInfoResponse, IIdentityByAddressQuery} from '../types/schemaTypes/identity.interface';
import { Logger } from '../logger';
import { ITXWithIdentity } from '../types/schemaTypes/tx.interface';
import { IListStruct, ListStruct } from '../types';
import {hubDefaultEmptyValue} from "../constant";
import {
  queryIdentityListHelper
} from '../helper/params.helper';

export const IdentitySchema = new mongoose.Schema({
  identities_id: String,
  owner: String,
  credentials: String,
  'create_block_height': Number,
  'create_block_time': Number,
  'create_tx_hash': String,
  'update_block_height': Number,
  'update_block_time': Number,
  'update_tx_hash': String,
  create_time: Number,
  update_time: Number,
})
IdentitySchema.index({identities_id: 1},{unique: true})
IdentitySchema.index({update_block_height: -1,owner:-1})
IdentitySchema.statics = {
  async queryIdentityList(query:ITXWithIdentity):Promise<ListStruct> {
    const result: ListStruct = {}
    const queryParameters = queryIdentityListHelper(query);
    result.data = await this.find(queryParameters)
        .skip((Number(query.pageNum) - 1) * Number(query.pageSize))
        .limit(Number(query.pageSize)).sort({'update_block_height':-1});
    return result;
  },
  async queryIdentityListCount(query:ITXWithIdentity):Promise<number> {
    const queryParameters = queryIdentityListHelper(query);
    return await this.find(queryParameters).countDocuments();
  },

  async queryIdentityCount(query:any){
    return await this.find(query || {}).countDocuments();
  },

  async queryHeight() {
      const height = await this.findOne({}).sort({'update_block_height': -1})
      const blockHeight = height ? height.update_block_height : 0
      return blockHeight
  },

  async insertIdentityInfo(IdentityInfo) {
      await  this.insertMany(IdentityInfo,{ ordered: false },(error) => {
        //console.log(error)
      })
  },
  // base information
  async updateIdentityInfo(updateIdentityData) {
    const {identities_id,update_block_time,update_block_height,update_tx_hash,update_time} = updateIdentityData
    if(updateIdentityData.credentials && updateIdentityData.credentials !== hubDefaultEmptyValue){
        const { credentials } = updateIdentityData;
        await this.updateOne({identities_id},{credentials,update_block_time,update_block_height,update_tx_hash,update_time});
      }else {
        await this.updateOne({identities_id},{update_block_time,update_block_height,update_tx_hash,update_time});
      }
  },
  async queryIdentityInfo(id:IIdentityInfoQuery):Promise<IIdentityInfoResponse> {
    const queryId = {identities_id:id.id}
    const infoData:IIdentityInfoResponse = await this.findOne(queryId)
    return  infoData
  },
  // owner
  async queryIdentityByAddress(query: IIdentityByAddressQuery):Promise<ListStruct>{
    const result: ListStruct = {}
    const queryParameters: any = {};
    queryParameters.owner = query.address
    result.data = await this.find(queryParameters)
        .skip((Number(query.pageNum) - 1) * Number(query.pageSize))
        .limit(Number(query.pageSize)).sort({'update_block_height':-1});
    return result
  },
  async queryIdentityByAddressCount(query: IIdentityByAddressQuery):Promise<number> {
    const queryParameters: any = {};
    queryParameters.owner = query.address
    return await this.find(queryParameters).countDocuments();
  },
}

