import * as mongoose from 'mongoose';
import { getTimestamp } from '../util/util';
import { IDenomStruct } from '../types/schemaTypes/denom.interface';

export const DenomSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    json_schema: String,
    creator: String,
    create_time: Number,
    update_time: Number,
});

DenomSchema.statics = {
    async findList(): Promise<IDenomStruct[]> {
        return await this.find().select({
            _id:0,
            create_time:0,
            update_time:0,
            __:0,
        }).exec();
    },

    async saveBulk(denoms: any[]): Promise<IDenomStruct[]> {
        const entitiesList: IDenomStruct[] = denoms.map((d) => {
            return {
                name: d.name,
                json_schema: d.schema,
                creator: d.creator,
                create_time: getTimestamp(),
                update_time: getTimestamp(),
            };
        });
        return await this.insertMany(entitiesList, { ordered: false });
    },
    async findAllNames(): Promise<IDenomStruct[]> {
        return await this.find({}, { name: 1 }).exec();
    },
};