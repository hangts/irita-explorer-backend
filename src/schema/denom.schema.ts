import * as mongoose from 'mongoose';
import { getTimestamp } from '../util/util';
import { IDenomMapStruct, IDenomStruct } from '../types/schemaTypes/denom.interface';
import { Logger } from '../logger';

export const DenomSchema = new mongoose.Schema({
    name: String,
    json_schema: String,
    denom_id: { type: String, unique: true },
    creator: String,
    owner: String,
    tx_hash: String,
    height: Number,
    time:Number,
    create_time: Number,
    last_block_height: Number,
    last_block_time: Number,
}, { versionKey: false });
// 新增
DenomSchema.index({ height: 1}, { background:true});
DenomSchema.index({ name: 1, height: 1}, { background:true});

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
                // const reg = new RegExp(denomNameOrId, 'i');
                params['$or'] = [
                    { 'name': denomNameOrId },
                    { 'denom_id': denomNameOrId },
                ];
            }
            return await this.find(params)
                .skip((Number(pageNum) - 1) * Number(pageSize))
                .limit(Number(pageSize))
                .sort({ height: -1 });
        }
    },
    async queryDenomCount(denomNameOrId?: string){
        const params = {};
        if(denomNameOrId){
            // const reg = new RegExp(denomNameOrId, 'i');
            params['$or'] = [
                { 'name': denomNameOrId },
                { 'denom_id': denomNameOrId },
            ]
        }
        return this.countDocuments(params);
    },
    async queryAllCount(){
        return this.countDocuments({});
    },
    async findOneByDenomId(denomId:string): Promise<IDenomStruct> {
        return await this.findOne({denom_id:denomId});
    },
    // async saveDenom(denoms: IDenomMapStruct): Promise<IDenomStruct[]> {
    //     return await this.create({
    //         name: denoms.name,
    //         denom_id: denoms.denomId,
    //         json_schema: denoms.jsonSchema,
    //         creator: denoms.creator,
    //         tx_hash: denoms.txHash,
    //         height: denoms.height,
    //         time: denoms.createTime,
    //         create_time: getTimestamp(),
    //         update_time: getTimestamp(),
    //     });
    // },
    // async findAllNames(): Promise<IDenomStruct[]> {
    //     return await this.find({}, { denom_id: 1, name: 1 }).exec();
    // },
    //
    // async updateDenom(denom: IDenomMapStruct): Promise<IDenomStruct> {
    //     return await this.findOneAndUpdate({
    //         denom_id:denom.denomId,
    //     }, {
    //         tx_hash: denom.txHash,
    //         height: denom.height,
    //         time:denom.createTime,
    //         update_time: getTimestamp(),
    //     });
    // },
    async updateDenomOwner(denomId: string, newOwner: string,txHeight: number,txTime: number): Promise<IDenomStruct> {
        return await this.findOneAndUpdate({
            denom_id: denomId,
        }, {
            owner: newOwner,
            update_time: getTimestamp(),
            last_block_height: txHeight,
            last_block_time: txTime,
        });
    },


    async findAllInDenomID(denomIds: string[]): Promise<IDenomStruct> {
        return await this.find({ denom_id: {'$in':denomIds}}, { json_schema: 0 });
    },


    async findListWithDenomIds(denomIds: string[]): Promise<IDenomStruct> {
        return await this.find({ denom_id: {'$in':denomIds}});
    },

    async findOneByDenomAndNftIdFromDenom(denomId: string): Promise<IDenomStruct> {
        return await this.findOne({ denom_id: denomId}, { json_schema: 1 , name: 1})
    },

    async findLastBlockHeight(): Promise<IDenomStruct[]> {
        return await this.find({}, { last_block_height: 1 }).sort({last_block_height:-1}).limit(1)
    },

    async insertManyDenom(denomList): Promise<IDenomStruct[]>{
       return await this.insertMany(denomList,{ ordered: false },(error) => {
           if(JSON.stringify(error).includes('E11000 duplicate key error collection')){
           }else {
               Logger.error(error)
           }
       })
    },
};

// statistics_task
DenomSchema.statics.queryIncreDenomCount = async function(height :number): Promise<number> {
    return await this.find({'height':{$gte:height}}).countDocuments();
};

DenomSchema.statics.queryDenomCountWithHeight = async function(height :number): Promise<number> {
    return await this.find({'height':height}).countDocuments();
};

DenomSchema.statics.queryLatestHeight = async function(height :number): Promise<IDenomStruct> {
    return await this.findOne({'height':{$gte:height}},{height:1}).sort({ height: -1 });
};