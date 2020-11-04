import * as mongoose from 'mongoose';
import {ITokens} from "../types/schemaTypes/tokens.interface";

export const TokensSchema = new mongoose.Schema({
    symbol: String,
    min_unit: String,
    scale: String,
    is_main_token: Boolean,
    initial_supply: String,
    max_supply: String,
    mintable: Boolean,
    owner: String,
    name: String,
    total_supply: String,
    mint_token_time: Number
})
TokensSchema.index({symbol: 1}, {unique: true})

TokensSchema.statics = {
    async insertTokens(Tokens: ITokens) {
        //设置 options 查询不到就插入操作
        let {min_unit} = Tokens
        const options = {upsert: true, new: false, setDefaultsOnInsert: true}
        await this.findOneAndUpdate({min_unit}, Tokens, options)
    },
    async queryAllTokens() {
        return await this.find({})
    },
    async queryMainToken() {
        return await this.findOne({is_main_token:true});
    }
}
