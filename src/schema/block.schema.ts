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
    async findBlockList(pageNum: number, pageSize: number): Promise<IBlockEntities[]>{
        return await this.find({}).sort({ height: -1 }).skip((pageNum - 1) * pageSize).limit(pageSize).exec();
    },

    async count(): Promise<number>{
        return await this.find({}).count().exec();
    },

    async findOneByHeight(height: number): Promise<IBlockEntities | null>{
        return await this.findOne({ height });
    },

    async findOneByHeightDesc(): Promise<IBlockEntities | null>{
        const res: IBlockEntities[] = await this.find({}).sort({ height: -1 }).limit(1);
        if(res && res.length > 0){
            return res[0];
        }else {
            return null;
        }
    },

    async findNum100Height():Promise<IBlockEntities | null>{
        const res: IBlockEntities[] = await this.find({}).sort({ height: -1 }).limit(100);
        if(res && res.length > 0){
            return res[res.length - 1]
        }else {
            return null
        }
    }


};