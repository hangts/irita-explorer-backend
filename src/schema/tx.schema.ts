import * as mongoose from 'mongoose';
import { ITxsQuery, 
		 ITxsWhthHeightQuery,
		 ITxsWhthAddressQuery,
	     ITxsWhthNftQuery,
	 	 ITxsWhthServiceNameQuery} from '../types/schemaTypes/tx.interface';
import { ITxsQueryParams} from '../types/tx.interface';
import {IListStruct} from '../types';
import { TxType } from '../constant';
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

// txs
TxSchema.statics.queryTxList = async function (query:ITxsQuery){
	let result:IListStruct = {};
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
    if ((query.beginTime && query.beginTime.length) || (query.endTime && query.endTime.length)) {queryParameters.time = {};}
    if (query.beginTime && query.beginTime.length) { queryParameters.time.$gte =  new Date(Number(query.beginTime) * 1000) }
    if (query.endTime && query.endTime.length) { queryParameters.time.$lte =  new Date(Number(query.endTime) * 1000) }
    
    result.data = await this.find(queryParameters)
					 		.sort({height:-1})
					 		.skip((Number(query.pageNum) - 1) * Number(query.pageSize))
					 		.limit(Number(query.pageSize));
    
    if (query.useCount && query.useCount=='true') {
        result.count = await this.find(queryParameters).count();
    }
	return result;
}

// txs/blocks
TxSchema.statics.queryTxWithHeight = async function(query:ITxsWhthHeightQuery){
	let result:IListStruct = {};
	let queryParameters:{height?:number} = {};
	if (query.height) { queryParameters.height = Number(query.height);}
	result.data = await this.find(queryParameters)
					 		.sort({height:-1})
					 		.skip((Number(query.pageNum) - 1) * Number(query.pageSize))
					 		.limit(Number(query.pageSize));
	if (query.useCount && query.useCount=='true') {
        result.count = await this.find(queryParameters).count();
    }
	return result;
}

//  txs/addresses
TxSchema.statics.queryTxWithAddress = async function(query:ITxsWhthAddressQuery){
	let result:IListStruct = {};
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
					 		.skip((Number(query.pageNum) - 1) * Number(query.pageSize))
					 		.limit(Number(query.pageSize));
	if (query.useCount && query.useCount=='true') {
        result.count = await this.find(queryParameters).count();
    }
	return result;
}

//  txs/nfts
TxSchema.statics.queryTxWithNft = async function(query:ITxsWhthNftQuery){
	let result:IListStruct = {};
	let queryParameters:{denom?:string,tokenId?:string} = {};
	if (query.denom && query.denom.length) {
		queryParameters['msgs.msg.denom'] = query.denom;
	}
	if (query.tokenId && query.tokenId.length) {
		queryParameters['msgs.msg.id'] = query.tokenId;
	}	
	result.data = await this.find(queryParameters)
					 		.sort({height:-1})
					 		.skip((Number(query.pageNum) - 1) * Number(query.pageSize))
					 		.limit(Number(query.pageSize));
	if (query.useCount && query.useCount=='true') {
        result.count = await this.find(queryParameters).count();
    }
	return result;
}

//  txs/services
TxSchema.statics.queryTxWithServiceName = async function(query:ITxsWhthServiceNameQuery){
	let result:{count?:number, data?:any[]} = {};
	let queryParameters:{servicesName?:string} = {};
	if (query.serviceName && query.serviceName.length) {
		queryParameters['msgs.msg.service_name'] = query.serviceName;
	}
	result.data = await this.find(queryParameters)
					 		.sort({height:-1})
					 		.skip((Number(query.pageNum) - 1) * Number(query.pageSize))
					 		.limit(Number(query.pageSize));
	if (query.useCount && query.useCount=='true') {
        result.count = await this.find(queryParameters).count();
    }
	return result;
}

//  txs/services/detail/{serviceName}
TxSchema.statics.queryTxDetailWithServiceName = async function(serviceName:string){
	return await this.findOne({'msgs.msg.name':serviceName,type:'define_service'});
}

//  txs/{hash}
TxSchema.statics.queryTxWithHash = async function(hash:string){
	return await this.findOne({tx_hash:hash});
}

//  /statistics
TxSchema.statics.queryTxStatistics = async function(){
	let txCount = await this.find().count();
	let serviceCount = await this.find({type:TxType.define_service}).count();
	return  {
		txCount,
		serviceCount
	};
}


