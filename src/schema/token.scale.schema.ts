import * as mongoose from 'mongoose';
import {ITokenScale} from "../types/schemaTypes/token.scale.interface";

export const TokenScaleSchema = new mongoose.Schema({
    symbol: String,
    min_unit: String,
    scale: String,
    is_main_token: Boolean,
    initial_supply: String,
    max_supply: String,
    mintable: Boolean,
    owner: String,
    name: String,

})
TokenScaleSchema.index({symbol: 1}, {unique: true})

TokenScaleSchema.statics = {
    async insertTokenScale(tokenScale: ITokenScale) {
        //设置 options 查询不到就插入操作
        let {min_unit} = tokenScale
        const options = {upsert: true, new: false, setDefaultsOnInsert: true}
        await this.findOneAndUpdate({min_unit}, tokenScale, options)
    },
    async queryAllTokens() {
        return await this.find({})
    },
    async queryMainToken() {
        return await this.findOne({is_main_token:true});
    }
}
