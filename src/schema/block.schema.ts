import * as mongoose from 'mongoose';
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
    findList: async function(pageNum: number, pageSize: number): Promise<IBlockEntities[]>{
        try{
            return await this.find({}).sort({ height: -1 }).skip((pageNum - 1) * pageSize).limit(pageSize).exec();
        }catch (e) {
            new Logger().error('mongo-error:',e.message);
            throw new ApiError(ErrorCodes.failed,e.message);
        }
    },

    count: async function(): Promise<number>{
        try{
            return await this.find({}).count().exec();
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

    findOneByHeightDesc: async function(): Promise<IBlockEntities | null>{
        try {
            const res: IBlockEntities[] = await this.find({}).sort({ height: -1 }).skip(0).limit(1);
            if(res && res.length > 0){
                return res[0];
            }else {
                return null;
            }
        } catch (e) {
            new Logger().log('mongo-error:',e.message);
            throw new ApiError(ErrorCodes.failed, ResultCodesMaps.get(ErrorCodes.failed));
        }
    },

    async findNum100Height():Promise<IBlockEntities | null>{
        try {
            const res: IBlockEntities[] = await this.find({}).sort({ height: -1 }).skip(0).limit(100);
            if(res && res.length > 0){
                return res[res.length - 1]
            }else {
                return null
            }

        } catch (e) {
            new Logger().log('mongo-error:',e.message);
            throw new ApiError(ErrorCodes.failed, ResultCodesMaps.get(ErrorCodes.failed));
        }
    }


};