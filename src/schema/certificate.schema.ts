import * as mongoose from 'mongoose'
import { IListStruct,ListStruct } from '../types';
import {
  IIdentityPubKeyAndCertificateQuery,
} from '../types/schemaTypes/identity.interface';

export const CertificateSchema = new mongoose.Schema({
  identities_id:String,
  certificate:String,
  hash: String,
  height: Number,
  time: Number,
  'msg_index': Number,
  certificate_hash:String,
  create_time:Number
})
CertificateSchema.index({ identities_id: 1, certificate_hash: 1 }, { unique: true })
CertificateSchema.index({ identities_id: 1, height: 1 })

CertificateSchema.statics = {
  async insertCertificate(certificateData){
    const query = {
      identities_id:certificateData.identities_id,
      certificate_hash:certificateData.certificate_hash}
    await this.findOneAndUpdate(query,certificateData,{upsert:true,new: true})
  },
  async queryCertificate(query:IIdentityPubKeyAndCertificateQuery):Promise<ListStruct>{
    const result: ListStruct = {}
    const queryParameters: any = {};
    queryParameters.identities_id = query.id
    result.data = await this.find(queryParameters)
      .skip((Number(query.pageNum) - 1) * Number(query.pageSize))
      .limit(Number(query.pageSize)).sort({'height':-1});
    return result
  },
  async queryCertificateCount(query:IIdentityPubKeyAndCertificateQuery):Promise<number> {
    const queryParameters: any = {};
    queryParameters.identities_id = query.id
    return await this.find(queryParameters).countDocuments();
  },
}
