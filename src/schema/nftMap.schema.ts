import * as mongoose from 'mongoose';
import { Logger } from '../logger';
import {
    INftMapStruct
} from '../types/schemaTypes/nft.interface';
import { getTimestamp } from '../util/util';

export const NftMapSchema = new mongoose.Schema({
    denom: String,
    denom_name: String,
    nft_id: String,
    nft_name: String,
},{versionKey: false});
NftMapSchema.index({ denom: 1, nft_id: 1 }, { unique: true });

NftMapSchema.statics = {
    async findName(denom: string, nftId?: string): Promise<INftMapStruct[]> {
        let query: any = { denom:denom };
        if (nftId && nftId.length){
            query.nft_id = nftId;
        }
        return await this.findOne(query);
    },
};