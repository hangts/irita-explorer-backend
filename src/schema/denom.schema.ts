import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Logger } from '@nestjs/common';
import { ErrorCodes } from '../api/ResultCodes';
import { ApiError } from '../api/ApiResult';
import { getTimestamp } from '../util/util';

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
    async findList(): Promise<IDenomEntities[]> {
        try {
            return await this.find({}).exec();
        } catch (e) {
            new Logger().error('mongo-error:', e.message);
            throw new ApiError(ErrorCodes.failed, e.message);
        }
    },

    async count(): Promise<number> {
        try {
            return await this.blockModel.find().count().exec();
        } catch (e) {
            new Logger().error('mongo-error:', e.message);
            throw new ApiError(ErrorCodes.failed, e.message);
        }
    },

    async saveBulk(denoms: any): Promise<any> {
        try {
            const entitiesList: IDenomEntities[] = denoms.map((d) => {
                return {
                    name: d.name,
                    json_schema: d.schema,
                    creator: d.creator,
                    create_time: getTimestamp(),
                    update_time: getTimestamp(),
                };
            });
            return await this.insertMany(entitiesList, { ordered: false });
        } catch (e) {
            new Logger().error('mongo-error: save denom failed:', e.message);
            return true;// 不管是否插入成功, 需要释放is_locked, 返回true;
        }
    },
    async findAllNames(): Promise<string[]> {
        try {
            return await this.find({}, { name: 1 }).exec();
        } catch (e) {
            new Logger().error('mongo-error:', e.message);
            throw new ApiError(ErrorCodes.failed, e.message);
        }
    },
};