import * as mongoose from 'mongoose';
import { ITxsQueryParams, ITxsQuery} from '../types/tx.interface';

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

TxSchema.statics.queryTxList = async function (query:ITxsQuery){
	let result:{count?:number, data?:any} = {};
    let queryParameters:ITxsQueryParams = {};
    if (query.type && query.type.length) { queryParameters.type = query.type}
    if (query.status && query.status.length) { 
        switch(query.status){
            case '1':
            queryParameters.status = 1; 
            break;
            case '2':
            queryParameters.status = 0; 
            break;
        }
    }
    if (query.beginTime && query.beginTime.length) { queryParameters.time.$gte =  new Date(Number(query.beginTime) * 1000) }
    if (query.endTime && query.endTime.length) { queryParameters.time.$lte =  new Date(Number(query.endTime) * 1000) }
    
    result.data = await this.find(queryParameters)
					 		.sort({height:-1})
					 		.skip((Number(query.pageNumber) - 1) * Number(query.pageSize))
					 		.limit(Number(query.pageSize));
    
    if (query.useCount && query.useCount=='true') {
        result.count = await this.find(queryParameters).count();
    }
	return result;
}



