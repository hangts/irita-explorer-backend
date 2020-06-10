import * as mongoose from 'mongoose';
import { getTimestamp } from '../util/util';
import { IDenomEntities} from '../types/denom.interface';

export const DenomSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    json_schema: String,
    creator: String,
    create_time: Number,
    update_time: Number,
});

DenomSchema.statics = {
    async findList(): Promise<IDenomEntities[]> {
        return await this.find({}).exec();
    },

    /*async count(): Promise<number> {
        return await this.blockModel.find().count().exec();
    },*/

    async saveBulk(denoms: any): Promise<IDenomEntities[]> {
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
    },
    async findAllNames(): Promise<string[]> {
        return await this.find({}, { name: 1 }).exec();
    },
};