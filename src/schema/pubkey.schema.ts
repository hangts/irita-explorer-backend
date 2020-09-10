import * as mongoose from 'mongoose';
import { IListStruct } from '../types';
import { IIdentityPubKeyAndCertificateQuery } from '../types/schemaTypes/identity.interface'
export const PubkeySchema = new mongoose.Schema({
    identities_id: String,
    pubkey: Object,
    hash: String,
    height: Number,
    time: Number,
    'msg_index': Number,
    create_time:Number
})
PubkeySchema.index({msg_index:1,hash: 1},{unique: true})

PubkeySchema.statics = {
    async insertPubkey (pubkey) {
        await this.insertMany(pubkey,{ ordered: false })
    },
    async queryPubkeyList(query:IIdentityPubKeyAndCertificateQuery) :Promise<IListStruct>  {
        const result: IListStruct = {}
        const queryParameters: any = {};
        queryParameters.identities_id = query.id
        result.data = await this.find(queryParameters)
          .skip((Number(query.pageNum) - 1) * Number(query.pageSize))
          .limit(Number(query.pageSize)).sort({'time':-1});

        if (query.useCount && query.useCount == true) {
            result.count = await this.find(queryParameters).countDocuments();
        }
        return result
    }
}
