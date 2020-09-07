import * as mongoose from 'mongoose'
import { IIdentityInfoQuery,IIdentityInfoResponse, IIdentityByAddressQuery} from '../types/schemaTypes/identity.interface';
import { Logger } from '../logger';
import { ITXWithIdentity } from '../types/schemaTypes/tx.interface';
import { IListStruct } from '../types';

export const IdentitySchema = new mongoose.Schema({
  id: String,
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
IdentitySchema.index({id: 1},{unique: true})
IdentitySchema.statics = {
  async queryIdentityList(query:ITXWithIdentity):Promise<IListStruct> {
    const result: IListStruct = {}
    const queryParameters: any = {};
    if(query.search && query.search !== ''){
      //单条件模糊查询使用$regex $options为'i' 不区分大小写
      queryParameters.$or = [
        {id:{ $regex: query.search,$options:'i' }},
        {owner:{ $regex: query.search,$options:'i' }}
      ]
    }
    if (query.useCount && query.useCount == true) {
      result.count = await this.find(queryParameters).countDocuments();
    }
    result.data = await this.find(queryParameters)
        .skip((Number(query.pageNum) - 1) * Number(query.pageSize))
        .limit(Number(query.pageSize)).sort({'update_block_time':-1});
    return result;
  },

  async queryHeight() {
      const height = await this.findOne({}).sort({'update_block_height': -1})
      const blockHeight = height ? height.update_block_height : 0
      return blockHeight
  },

  async insertIdentityInfo(IdentityInfo) {
      await  this.insertMany(IdentityInfo,{ ordered: false })
  },
  // base information
  async updateIdentityInfo(updateIdentityData) {
      if(updateIdentityData.credentials){
        const { id,credentials, update_block_time, update_block_height, update_tx_hash } = updateIdentityData;
        await this.updateOne({id},{credentials,update_block_time,update_block_height,update_tx_hash});
      }else {
        const { id, update_block_time, update_block_height, update_tx_hash } = updateIdentityData;
        await this.updateOne({id},{update_block_time,update_block_height,update_tx_hash});
      }
  },
  async queryIdentityInfo(id:IIdentityInfoQuery):Promise<IIdentityInfoResponse> {
    const infoData:IIdentityInfoResponse = await this.findOne(id)
    return  infoData
  },
  // owner
  async queryIdentityByAddress(query: IIdentityByAddressQuery):Promise<IListStruct>{
    const result: IListStruct = {}
    const queryParameters: any = {};
    queryParameters.owner = query.address

    result.data = await this.find(queryParameters)
        .skip((Number(query.pageNum) - 1) * Number(query.pageSize))
        .limit(Number(query.pageSize)).sort({'update_block_time':-1});
    if (query.useCount && query.useCount == true) {
      result.count = await this.find(queryParameters).countDocuments();
    }
    return result
  }
}

