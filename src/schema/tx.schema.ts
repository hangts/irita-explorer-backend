import * as mongoose from 'mongoose';
import {
    ITxsQuery,
    ITxsWhthHeightQuery,
    ITxsWhthAddressQuery,
    ITxsWhthNftQuery,
    ITxsWhthServiceNameQuery, IExFieldQuery,
} from '../types/schemaTypes/tx.interface';
import { ITxStruct, ITxStructMsgs, ITxStructHash } from '../types/schemaTypes/tx.interface';
import { ITxsQueryParams} from '../types/tx.interface';
import {IListStruct} from '../types';
import { TxType } from '../constant';
import { cfg } from '../config/config';
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
},{versionKey: false});

//	csrb 浏览器交易记录过滤正则表达式
function filterExTxTypeRegExp():object{
	return new RegExp(`${TxType.mint_token}|${TxType.transfer_token_owner}|${TxType.issue_token}|${TxType.edit_token}`);
}

// 	txs
TxSchema.statics.queryTxList = async function (query:ITxsQuery):Promise<IListStruct>{
	let result:IListStruct = {};
    let queryParameters:ITxsQueryParams = {};
    if (query.type && query.type.length) { 
    	queryParameters.type = query.type
    }else{
    	queryParameters.$nor = [{type:filterExTxTypeRegExp()}];
    }
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
    if (query.useCount && query.useCount == true) {
        result.count = await this.find(queryParameters).countDocuments();
    }
	return result;
}

// 	txs/blocks
TxSchema.statics.queryTxWithHeight = async function(query:ITxsWhthHeightQuery):Promise<IListStruct>{
	let result:IListStruct = {};
	let queryParameters:{height?:number,$nor:object[]} = {$nor:[{type:filterExTxTypeRegExp()}]};
	if (query.height) { queryParameters.height = Number(query.height);}
	result.data = await this.find(queryParameters)
					 		.sort({height:-1})
					 		.skip((Number(query.pageNum) - 1) * Number(query.pageSize))
					 		.limit(Number(query.pageSize));
	if (query.useCount && query.useCount == true) {
        result.count = await this.find(queryParameters).countDocuments();
    }
	return result;
}

//  txs/addresses
TxSchema.statics.queryTxWithAddress = async function(query:ITxsWhthAddressQuery):Promise<IListStruct>{
	let result:IListStruct = {};
	let queryParameters:any = {};
	if (query.address) { 
		queryParameters = {
			$or:[
				{"from":query.address},
				{"to":query.address},
				{"signer":query.address},
			],
			$nor:[{type:filterExTxTypeRegExp()}]
		};
	}
	result.data = await this.find(queryParameters)
					 		.sort({height:-1})
					 		.skip((Number(query.pageNum) - 1) * Number(query.pageSize))
					 		.limit(Number(query.pageSize));
	if (query.useCount && query.useCount == true) {
        result.count = await this.find(queryParameters).countDocuments();
    }
	return result;
}

//  txs/nfts
TxSchema.statics.queryTxWithNft = async function(query:ITxsWhthNftQuery):Promise<IListStruct>{
	let result:IListStruct = {};
	let queryParameters:{denom?:string, tokenId?:string, $nor:object[]} = {$nor:[{type:filterExTxTypeRegExp()}]};
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
	if (query.useCount && query.useCount == true) {
        result.count = await this.find(queryParameters).countDocuments();
    }
	return result;
}

//  txs/services
TxSchema.statics.queryTxWithServiceName = async function(query:ITxsWhthServiceNameQuery):Promise<IListStruct>{
	let result:IListStruct = {};
	let queryParameters: any = {};
	if (query.serviceName && query.serviceName.length) {
		queryParameters = {
			$or:[
				{'msgs.msg.service_name':query.serviceName},
				{'msgs.msg.ex.service_name':query.serviceName}
			],
			$nor:[{type:filterExTxTypeRegExp()}]
		};
	}
	result.data = await this.find(queryParameters)
					 		.sort({height:-1})
					 		.skip((Number(query.pageNum) - 1) * Number(query.pageSize))
					 		.limit(Number(query.pageSize));
	if (query.useCount && query.useCount == true) {
        result.count = await this.find(queryParameters).countDocuments();
    }
	return result;
}

//  txs/services/detail/{serviceName}
TxSchema.statics.queryTxDetailWithServiceName = async function(serviceName:string):Promise<ITxStruct>{
	return await this.findOne({'msgs.msg.name':serviceName,type:TxType.define_service});
}

//  txs/{hash}
TxSchema.statics.queryTxWithHash = async function(hash:string):Promise<ITxStruct>{
	return await this.findOne({tx_hash:hash});
}

//  /statistics
TxSchema.statics.queryTxStatistics = async function():Promise<{txCount:number,serviceCount:number}>{
	let txCount = await this.find().countDocuments();
	let serviceCount = await this.find({type:TxType.define_service}).countDocuments();
	return  {
		txCount,
		serviceCount
	};
}

//	获取指定条数的serviceName==null&&type == respond_service 的 tx
TxSchema.statics.findRespondServiceTx = async function(pageSize?:number):Promise<ITxStructHash[]>{
	pageSize = pageSize || cfg.taskCfg.syncTxServiceNameSize;
	return await this.find({
							type:TxType.respond_service,
							/*'msgs.msg.ex.service_name':null*/
						},{tx_hash:1,'msgs.msg.request_id':1})
					 .sort({height:-1})
					 .limit(Number(pageSize));
}

//	根据Request_Context_Id list && type == call_service 获取指定tx list
TxSchema.statics.findCallServiceTxWithReqContextIds = async function(reqContextIds:string[]):Promise<ITxStructMsgs[]>{
	if (!reqContextIds || !reqContextIds.length) {return []};
	let query = {
		type:TxType.call_service,
		'events.attributes.value':{$in:reqContextIds}
	};
	return await this.find(query,{'events.attributes':1,"msgs.msg.service_name":1, "msgs.msg.consumer":1, "tx_hash": 1});
}

//	根据Request_Context_Id list && type == call_service 获取指定tx list
TxSchema.statics.updateServiceNameToResServiceTxWithTxHash = async function(txHash:string, serviceName:string, requestContextId:string, callHash: string, consumer: string):Promise<ITxStruct>{
	if (!txHash || !txHash.length) {return null};
	let query = {
		tx_hash:txHash,
	};
	let updateParams: any = {
	    $set: {
	        'msgs.0.msg.ex.service_name': serviceName,
            'msgs.0.msg.ex.request_context_id': requestContextId,
            'msgs.0.msg.ex.call_hash': callHash,
            'msgs.0.msg.ex.consumer': consumer,
	    }
	};
	return await this.findOneAndUpdate(query,updateParams);
}

//定时任务, 查询所有关于service的tx
TxSchema.statics.findAllServiceTx = async function ():Promise<ITxStruct[]>{
    let queryParameters: any = {
        $or:[
            {"type":TxType.define_service},
            {"type":TxType.bind_service},
            {"type":TxType.call_service},
            /*{"type":TxType.respond_service},*/
            {"type":TxType.update_service_binding},
            {"type":TxType.disable_service_binding},
            {"type":TxType.enable_service_binding},
            {"type":TxType.refund_service_deposit},
            {"type":TxType.pause_request_context},
            {"type":TxType.start_request_context},
            {"type":TxType.kill_request_context},
            {"type":TxType.update_request_context},
        ],
        /*'msgs.msg.ex.service_name':null*/
    };
    return await this.find(queryParameters);
};

//用request_context_id查询call_service的service_name
TxSchema.statics.queryServiceName = async function (requestContextId: string):Promise<string>{
    let queryParameters: any = {
        type:'call_service',
        'events.attributes.value':{$in:requestContextId},
        status: 1
    };
    return await this.find(queryParameters);
};

//在msg结构中增加ex字段
TxSchema.statics.addExFieldForServiceTx = async function (ex: IExFieldQuery):Promise<string>{
    const {requestContextId, consumer, serviceName, callHash, hash, bind} = ex;
    let updateParams: any = {
        $set: {}
    };
    if(requestContextId){
        updateParams['$set']['msgs.0.msg.ex.request_context_id'] = requestContextId;
    }
    if(consumer){
        updateParams['$set']['msgs.0.msg.ex.consumer'] = consumer;
    }
    if(serviceName){
        updateParams['$set']['msgs.0.msg.ex.service_name'] = serviceName;
    }
    if(callHash){
        updateParams['$set']['msgs.0.msg.ex.call_hash'] = callHash;
    }
    if(bind){
        updateParams['$set']['msgs.0.msg.ex.bind'] = bind;
    }

    return await this.findOneAndUpdate({tx_hash:hash},updateParams);
};

//在msg结构中增加ex字段
TxSchema.statics.queryDefineServiceTxHashByServiceName = async function (serviceName: string):Promise<ITxStruct>{
    let queryParameters: any = {
        type:'define_service',
        'msgs.msg.name':serviceName,
    };
    return await this.findOne(queryParameters,{"tx_hash":1});
};





