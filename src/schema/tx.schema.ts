import * as mongoose from 'mongoose';

export const TxSchema = new mongoose.Schema({
    time:Date,
    height:Number,
    tx_hash:String,
    memo:String,
    status:Number,
    log:String,
    complex_msg:Boolean,
    type:String,
    from:String,
    to:String,
    coins:Array,
    signer:String,
    events:Array,
    msgs:Array,
    signers:Array
});

TxSchema.statics.findTx = async function (query: any, pageNumber:number, pageSize:number){
	return await this.find(query)
					 .sort({height:-1})
					 .skip(Number(pageNumber * pageSize))
					 .limit(Number(pageSize));
}

TxSchema.statics.count = async function (query: any){
	return await this.find(query).count();
}
