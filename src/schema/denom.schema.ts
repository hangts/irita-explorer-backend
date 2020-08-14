import * as mongoose from 'mongoose';
import { getTimestamp } from '../util/util';
import { IDenomStruct } from '../types/schemaTypes/denom.interface';

export const DenomSchema = new mongoose.Schema({
    name: String,
    json_schema: String,
    denom_id: { type: String, unique: true },
    creator: String,
    tx_hash: String,
    height: Number,
    create_time: Number,
    update_time: Number,
}, { versionKey: false });

DenomSchema.statics = {
    async findList(
        pageNum: number,
        pageSize: number,
        denomNameOrId?: string,
        needAll?: string,
    ): Promise<IDenomStruct[]> {
        if (needAll) {
            return await this.find({});
        } else {
            const params = {};
            if(denomNameOrId){
                params['$or'] = [
                    {
                        name: denomNameOrId,
                    },
                    {
                        denom_id: denomNameOrId,
                    },

                ]
            }
            return await this.find(params)
                .skip((Number(pageNum) - 1) * Number(pageSize))
                .limit(Number(pageSize))
                .sort({ create_time: -1 });
        }
    },

    async queryDenomCount(denomNameOrId?: string){
        const params = {};
        if(denomNameOrId){
            params['$or'] = [
                {
                    name: denomNameOrId,
                },
                {
                    denom_id: denomNameOrId,
                },

            ]
        }
        return this.countDocuments(params);
    },
    async findOneByDenomId(denomId:string): Promise<IDenomStruct> {
        return await this.findOne({denom_id:denomId});
    },
    async saveBulk(denoms: any[]): Promise<IDenomStruct[]> {
        const entitiesList: IDenomStruct[] = denoms.map((d) => {
            return {
                name: d.name,
                denom_id: d.denomId,
                json_schema: d.jsonSchema,
                creator: d.creator,
                tx_hash: d.txHash,
                height: d.height,
                create_time: d.createTime,
                update_time: getTimestamp(),
            };
        });
        return await this.insertMany(entitiesList, { ordered: false });
    },
    async findAllNames(): Promise<IDenomStruct[]> {
        return await this.find({}, { denom_id: 1, name: 1 }).exec();
    },
};