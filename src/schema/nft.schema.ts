import * as mongoose from 'mongoose';
import { BlockListVo } from '../vo/block.vo';
import { Document } from 'mongoose';
import { Logger } from '@nestjs/common';
import { ErrorCodes, ResultCodesMaps } from '../api/ResultCodes';
import { ApiError } from '../api/ApiResult';
import { cfg } from '../config';
import {deleteQuery} from '../types/nft.interface';

export interface INftEntities extends Document {
    denom: string,
    nft_id: string,
    owner: string,
    token_uri: string,
    token_data: string,
    create_time: number,
    update_time: number,
}

export const NftSchema = new mongoose.Schema({
    denom: String,
    nft_id: String,
    owner: String,
    token_uri: String,
    token_data: String,
    create_time: Number,
    update_time: Number,
});
NftSchema.index({denom:1, nft_id:1}, {unique: true});

NftSchema.statics = {
    findList: async function(pageNumber: number, pageSize: number): Promise<INftEntities[]> {
        try {
            return await this.find().sort({ height: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize).exec();
        } catch (e) {
            new Logger().error('mongo-error:', e.message);
            throw new ApiError(ErrorCodes.failed, e.message);
        }
    },

    count: async function(): Promise<number> {
        try {
            return await this.blockModel.find().count().exec();
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

    saveBulk: function(nfts: any): void {
        try {
            this.insertMany(nfts, { ordered: false });
        } catch (e) {
            new Logger().error('mongo-error:', e.message);
            //throw new ApiError(ErrorCodes.failed, e.message);
        }
    },

    deleteOneByDenomAndId: async function(nft: deleteQuery): Promise<void> {
        try {
            return await this.deleteOne(nft, (e)=>{
                if(e) new Logger().error('mongo-error:', e.message);
            });
        } catch (e) {
            new Logger().error('mongo-error:', e.message);
            //throw new ApiError(ErrorCodes.failed, e.message);
        }
    },



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