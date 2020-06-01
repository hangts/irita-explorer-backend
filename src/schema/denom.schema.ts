import * as mongoose from 'mongoose';

export const DenomSchema = new mongoose.Schema({
    name: String,
    json_schema:String,
    creator:String,
});
//Model layer, custom owner methods;
DenomSchema.statics = {
    findDenomListByName: async function (denom: string){

    }
};