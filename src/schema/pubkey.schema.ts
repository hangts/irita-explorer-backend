import * as mongoose from 'mongoose';
import { IListStruct,ListStruct } from '../types';
import { IIdentityPubKeyAndCertificateQuery } from '../types/schemaTypes/identity.interface'
export const PubkeySchema = new mongoose.Schema({
    identities_id: String,
    pubkey: Object,
    hash: String,
    height: Number,
    time: Number,
    'msg_index': Number,
    pubkey_hash: String,
    certificate_hash:String,
    create_time:Number
})
PubkeySchema.index({identities_id:1,pubkey_hash: 1},{unique: true})
PubkeySchema.index({identities_id:1,height: 1})

PubkeySchema.statics = {
    async insertPubkey (pubkey) {
        const query = {
            identities_id:pubkey.identities_id,
            pubkey_hash:pubkey.pubkey_hash}
        await this.findOneAndUpdate(query,pubkey,{ upsert:true,new: true})
    },
    async queryPubkeyList(query:IIdentityPubKeyAndCertificateQuery) :Promise<ListStruct>  {
        const result: ListStruct = {}
        const queryParameters: any = {};
        queryParameters.identities_id = query.id
        result.data = await this.find(queryParameters)
          .skip((Number(query.pageNum) - 1) * Number(query.pageSize))
          .limit(Number(query.pageSize)).sort({'height':-1});
        return result
    },
    async queryPubkeyListCount(query:IIdentityPubKeyAndCertificateQuery):Promise<number> {
      const queryParameters: any = {};
      queryParameters.identities_id = query.id
      return await this.find(queryParameters).countDocuments();
    },

    
}
