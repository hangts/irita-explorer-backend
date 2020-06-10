import * as mongoose from 'mongoose';

import { Logger } from '@nestjs/common';
import { deleteQuery } from '../types/nft.interface';
import { getTimestamp } from '../util/util';
import { INftEntities} from '../types/nft.interface';

export const NftSchema = new mongoose.Schema({
    denom: String,
    nft_id: String,
    owner: String,
    token_uri: String,
    token_data: String,
    create_time: Number,
    update_time: Number,
    hash: String,
});
NftSchema.index({ denom: 1, nft_id: 1 }, { unique: true });

NftSchema.statics = {
    async findList(pageNum: number, pageSize: number, denom?: string, nftId?: string): Promise<INftEntities[]> {
        let q: any = {};
        if (denom) q.denom = denom;
        if (nftId) q.nft_id = nftId;
        return await this.find(q).sort().skip((pageNum - 1) * pageSize).limit(pageSize).exec();
    },

    async findOneByDenomAndNftId(denom: string, nftId: string): Promise<INftEntities> {
        return await this.findOne({
            denom,
            nft_id: nftId,
        }).exec();
    },

    async queryCount(): Promise<number> {
        return await this.find().count().exec();
    },
    async findNftListByName(name: string): Promise<INftEntities> {
        return await this.find({ denom: name }).exec();
    },

    saveBulk(nfts: any): void {
        this.insertMany(nfts, { ordered: false });
    },

    async deleteOneByDenomAndId(nft: deleteQuery): Promise<void> {
        return await this.deleteOne(nft, (e) => {
            if (e) new Logger().error('mongo-error:', e.message);
        });
    },

    updateOneById(nft: any): void {
        const { nft_id, owner, token_data, token_uri, hash } = nft;
        this.updateOne({
            nft_id,
        }, {
            owner,
            token_data,
            token_uri,
            hash,
            update_time: getTimestamp(),
        }, (e) => {
            if (e) new Logger().error('mongo-error:', e.message);
        });
    },

};