import * as mongoose from 'mongoose';
import { ITxsQuery, 
		 ITxsWhthHeightQuery,
		 ITxsWhthAddressQuery,
	     ITxsWhthNftQuery,
	 	 ITxsWhthServiceNameQuery} from '../types/schemaTypes/tx.interface';
import { ITxsQueryParams} from '../types/tx.interface';
import {IListStruct} from '../types';
import { TxType } from '../constant';
import { cfg } from '../config';
export const TxSchema = new mongoose.Schema({
    time:Number,
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
    if (query.beginTime && query.beginTime.length) { queryParameters.time.$gte =  Number(query.beginTime) }
    if (query.endTime && query.endTime.length) { queryParameters.time.$lte =  Number(query.endTime) }
    
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
	let queryParameters = {};
	if (query.serviceName && query.serviceName.length) {
		queryParameters = {
			$or:[
				{'msgs.msg.service_name':query.serviceName},
				{'msgs.msg.ex.service_name':query.serviceName}
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

//获取指定条数的serviceName==null&&type == respond_service 的 tx
TxSchema.statics.findRespondServiceTx = async function(pageSize?:number){
	pageSize = pageSize || cfg.taskCfg.syncTxServiceNameSize;
	return await this.find({
							type:TxType.respond_service,
							'msgs.msg.ex.service_name':null
						},{tx_hash:1,'msgs.msg.request_id':1})
					 .sort({height:-1})
					 .limit(Number(pageSize));
}

//根据Request_Context_Id list && type == call_service 获取指定tx list
TxSchema.statics.findCallServiceTxWithReqContextIds = async function(reqContextIds:string[]){
	if (!reqContextIds || !reqContextIds.length) {return []};
	let query = {
		type:TxType.call_service,
		'events.attributes.value':{$in:reqContextIds}
	};
	return await this.find(query,{'events.attributes':1,"msgs.msg.service_name":1});
}

//根据Request_Context_Id list && type == call_service 获取指定tx list
TxSchema.statics.updateServiceNameToResServiceTxWithTxHash = async function(txHash:string, serviceName:string){
	if (!txHash || !txHash.length) {return null};
	let query = {
		tx_hash:txHash,
	};
	return await this.findOneAndUpdate(query,{$set: {'msgs.0.msg.ex.service_name': serviceName}});
}
