import * as mongoose from 'mongoose';

export const BlockSchema = new mongoose.Schema({
    height:Number,
    hash:String,
    txn:Number,
    time:Date,
});
//Model layer, custom owner methods;
BlockSchema.statics = {

};