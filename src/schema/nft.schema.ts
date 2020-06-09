import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Logger } from '@nestjs/common';
import { ErrorCodes } from '../api/ResultCodes';
import { ApiError } from '../api/ApiResult';
import {deleteQuery} from '../types/nft.interface';

export interface INftEntities extends Document {
    denom: string,
    nft_id: string,
    owner: string,
    token_uri: string,
    token_data: string,
    create_time: number,
    update_time: number,
    hash: string,
}

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
NftSchema.index({denom:1, nft_id:1}, {unique: true});

NftSchema.statics = {
    async findList(pageNum: number, pageSize: number, denom?: string, owner?: string): Promise<INftEntities[]> {
        try {
            let q: any = {};
            if(denom) q.denom = denom;
            if(denom) q.owner = owner;
            return await this.find(q).sort().skip((pageNum - 1) * pageSize).limit(pageSize).exec();
        } catch (e) {
            new Logger().error('mongo-error:', e.message);
            throw new ApiError(ErrorCodes.failed, e.message);
        }
    },

    async findOneByDenomAndNftId(denom: string, nftId: string): Promise<INftEntities>{
        try {
            return await this.findOne({
                denom,
                nft_id:nftId
            }).exec();
        } catch (e) {
            new Logger().error('mongo-error:', e.message);
            throw new ApiError(ErrorCodes.failed, e.message);
        }
    },

    async queryCount(): Promise<number> {
        try {
            return await this.find().count().exec();
        } catch (e) {
            new Logger().error('mongo-error:', e.message);
            throw new ApiError(ErrorCodes.failed, e.message);
        }
    },
    async findNftListByName(name: string): Promise<INftEntities>{
        try {
            return await this.find({denom: name}).exec();
        } catch (e) {
            new Logger().error('mongo-error:', e.message);
            throw new ApiError(ErrorCodes.failed, e.message);
        }
    },

    saveBulk(nfts: any): void {
        try {
            this.insertMany(nfts, { ordered: false });
        } catch (e) {
            new Logger().error('mongo-error:', e.message);
            //throw new ApiError(ErrorCodes.failed, e.message);
        }
    },

    async deleteOneByDenomAndId(nft: deleteQuery): Promise<void> {
        try {
            return await this.deleteOne(nft, (e)=>{
                if(e) new Logger().error('mongo-error:', e.message);
            });
        } catch (e) {
            new Logger().error('mongo-error:', e.message);
            //throw new ApiError(ErrorCodes.failed, e.message);
        }
    },

    updateOneById(nft: any): void{
        try {
            const { nft_id, owner, token_data, token_uri, hash } = nft;
            this.updateOne({
                nft_id
            },{
                owner,
                token_data,
                token_uri,
                hash,
                update_time:Math.floor(new Date().getTime()/1000)
            }, (e)=>{
                if(e) new Logger().error('mongo-error:', e.message);
            });
        } catch (e) {
            new Logger().error('mongo-error:', e.message);
            //throw new ApiError(ErrorCodes.failed, e.message);
        }
    }



    /*queryLatestBlockFromLcd: async function(): Promise<any>{
        try {
            const url: string = `${cfg.serverCfg.lcdAddr}/blocks/latest`;
            return await new HttpService().get(url).toPromise().then(res => res.data);
        } catch (e) {
            new Logger().error('api-error:',e.message);
            throw new ApiError(ErrorCodes.failed, ResultCodesMaps.get(ErrorCodes.failed));
        }

    },*/


};