import * as mongoose from 'mongoose';
import { ITxsQuery, 
		 ITxsWhthHeightQuery,
		 ITxsWhthAddressQuery,
	     ITxsWhthNftQuery,
	 	 ITxsWhthServiceNameQuery} from '../types/schemaQuery/tx.interface';
import { ITxsQueryParams} from '../types/tx.interface';

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

TxSchema.statics.queryTxWithHeight = async function(query:ITxsWhthHeightQuery){
	let result:{count?:number, data?:any} = {};
	let queryParameters:{height?:number} = {};
	if (query.height) { queryParameters.height = Number(query.height);}
	result.data = await this.find(queryParameters)
					 		.sort({height:-1})
					 		.skip((Number(query.pageNumber) - 1) * Number(query.pageSize))
					 		.limit(Number(query.pageSize));
	if (query.useCount && query.useCount=='true') {
        result.count = await this.find(queryParameters).count();
    }
	return result;
}

TxSchema.statics.queryTxWithAddress = async function(query:ITxsWhthAddressQuery){
	console.log('pppppp:',query);
	let result:{count?:number, data?:any} = {};
	let queryParameters:any = {};
	if (query.address) { 
		queryParameters = {
			$or:[
				{"from":query.address},
				{"to":query.address},
				{"signer":query.address},
			]
		};
	}
	result.data = await this.find(queryParameters)
					 		.sort({height:-1})
					 		.skip((Number(query.pageNumber) - 1) * Number(query.pageSize))
					 		.limit(Number(query.pageSize));
	if (query.useCount && query.useCount=='true') {
        result.count = await this.find(queryParameters).count();
    }
	return result;
}

TxSchema.statics.queryTxWithNft = async function(query:ITxsWhthNftQuery){
	let result:{count?:number, data?:any} = {};
	let queryParameters:{denom?:string,tokenId?:string} = {};
	if (query.denom && query.denom.length) {
		queryParameters['msgs.msg.denom'] = query.denom;
	}
	if (query.tokenId && query.tokenId.length) {
		queryParameters['msgs.msg.id'] = query.tokenId;
	}	
	result.data = await this.find(queryParameters)
					 		.sort({height:-1})
					 		.skip((Number(query.pageNumber) - 1) * Number(query.pageSize))
					 		.limit(Number(query.pageSize));
	if (query.useCount && query.useCount=='true') {
        result.count = await this.find(queryParameters).count();
    }
	return result;
}

TxSchema.statics.queryTxWithServiceName = async function(query:ITxsWhthServiceNameQuery){
	let result:{count?:number, data?:any} = {};
	let queryParameters:{servicesName?:string} = {};
	if (query.serviceName && query.serviceName.length) {
		queryParameters['msgs.msg.service_name'] = query.serviceName;
	}
	result.data = await this.find(queryParameters)
					 		.sort({height:-1})
					 		.skip((Number(query.pageNumber) - 1) * Number(query.pageSize))
					 		.limit(Number(query.pageSize));
	if (query.useCount && query.useCount=='true') {
        result.count = await this.find(queryParameters).count();
    }
	return result;
}

TxSchema.statics.queryTxDetailWithServiceName = async function(serviceName:string){
	return await this.findOne({'msgs.msg.name':serviceName,type:'define_service'});
}

TxSchema.statics.queryTxWithHash = async function(hash:string){
	return await this.findOne({tx_hash:hash});
}


