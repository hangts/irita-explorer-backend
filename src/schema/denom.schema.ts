import * as mongoose from 'mongoose';
import { BlockListVo } from '../vo/block.vo';
import { Document } from 'mongoose';
import { Logger } from '@nestjs/common';
import { ErrorCodes, ResultCodesMaps } from '../api/ResultCodes';
import { ApiError } from '../api/ApiResult';
import { cfg } from '../config';

export interface IDenomEntities extends Document {
    name: string,
    json_schema: string,
    creator: string,
    create_time: number,
    update_time: number,
}

export const DenomSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    json_schema: String,
    creator: String,
    create_time: Number,
    update_time: Number,
});

DenomSchema.statics = {
    findList: async function(): Promise<IDenomEntities[]> {
        try {
            return await this.find({}).exec();
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

    saveBulk: function(denoms: any): void {
        try {
            const entitiesList: IDenomEntities[] = denoms.map((d) => {
                return {
                    name: d.name,
                    json_schema: d.schema,
                    creator: d.creator,
                    create_time: Math.floor(new Date().getTime() / 1000),
                    update_time: Math.floor(new Date().getTime() / 1000),
                };
            });
            console.log(entitiesList);
            return this.insertMany(entitiesList, { ordered: false });
        } catch (e) {
            new Logger().error('mongo-error:', e.message);
            throw new ApiError(ErrorCodes.failed, e.message);
        }
    },
    async findAllNames(): Promise<string[]>{
        try {
            return await this.find({},{name:1}).exec();
        } catch (e) {
            new Logger().error('mongo-error:', e.message);
            throw new ApiError(ErrorCodes.failed, e.message);
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