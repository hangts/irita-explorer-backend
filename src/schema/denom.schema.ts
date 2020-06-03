import * as mongoose from 'mongoose';
import {BlockListVo} from '../vo/block.vo';
import { Document } from 'mongoose';
import { Logger, HttpService } from '@nestjs/common';
import { ErrorCodes, ResultCodesMaps } from '../api/ResultCodes';
import {ApiError} from '../api/ApiResult';
import {cfg} from '../config';

export interface IBlockEntities extends Document {
    name:string,
    json_schema:string,
    creator:string,
    create_time:string,
    update_time:string,
}
export const DenomSchema = new mongoose.Schema({
    name: String,
    json_schema:String,
    creator:String,
    create_time:String,
    update_time:String,
});
DenomSchema.index({name:1},{unique:true});

DenomSchema.statics = {
    findList: async function(pageNumber: number, pageSize: number): Promise<IBlockEntities[]>{
        try{
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

    queryLatestBlockFromLcd: async function(): Promise<any>{
        try {
            const url: string = `${cfg.serverCfg.lcdAddr}/blocks/latest`;
            return await new HttpService().get(url).toPromise().then(res => res.data);
        } catch (e) {
            new Logger().error('api-error:',e.message);
            throw new ApiError(ErrorCodes.failed, ResultCodesMaps.get(ErrorCodes.failed));
        }

    },




};