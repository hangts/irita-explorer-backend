import * as mongoose from 'mongoose';
import {BlockListVo} from '../vo/block.vo';
import { Document } from 'mongoose';
import { Logger } from '@nestjs/common';
import { ErrorCodes, ResultCodesMaps } from '../api/ResultCodes';
import {ApiError} from '../api/ApiResult';

export interface IBlockEntities extends Document {
    height:number,
    hash:string,
    txn:number,
    time:string,
}
export const BlockSchema = new mongoose.Schema({
    height:Number,
    hash:String,
    txn:Number,
    time:Date,
});

BlockSchema.statics = {
    findList: async function(v: BlockListVo): Promise<IBlockEntities[]>{
        try{
            const { pageNumber, pageSize} = v;
            return await this.find().sort({ height: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize).exec();
        }catch (e) {
            new Logger().error('mongo-error:',e.message);
            throw new ApiError(ErrorCodes.failed,e.message);
        }
    },

    count: async function(): Promise<number>{
        try{
            return await this.blockModel.find().count().exec();
        }catch (e) {
            new Logger().error('mongo-error:',e.message);
            throw new ApiError(ErrorCodes.failed,e.message);
        }
    },

    findOneByHeight: async function(p): Promise<IBlockEntities | null>{
        const { height } = p;
        try {
            return await this.findOne({ height });
        } catch (e) {
            new Logger().error('mongo-error:',e.message);
            throw new ApiError(ErrorCodes.failed, ResultCodesMaps.get(ErrorCodes.failed));
        }
    },

    findOneByHeightDesc: async function(): Promise<IBlockEntities>{
        try {
            return await this.findOne({}).sort({ height: -1 });
        } catch (e) {
            new Logger().log('mongo-error:',e.message);
            throw new ApiError(ErrorCodes.failed, ResultCodesMaps.get(ErrorCodes.failed));
        }
    },

};