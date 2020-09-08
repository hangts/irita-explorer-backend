import * as mongoose from 'mongoose';
import {
    ITxsQuery,
    ITxsWithHeightQuery,
    ITxsWithAddressQuery,
    ITxsWithContextIdQuery,
    ITxsWithNftQuery,
    ITxsWithServiceNameQuery,
    IExFieldQuery, IIdentityTx,
} from '../types/schemaTypes/tx.interface';
import { ITxStruct, ITxStructMsgs, ITxStructHash } from '../types/schemaTypes/tx.interface';
import { IBindTx, IServiceName, ITxsQueryParams } from '../types/tx.interface';
import { IListStruct } from '../types';
import { TxStatus, TxType } from '../constant';
import Cache from '../helper/cache';
import { cfg } from '../config/config';

export const TxSchema = new mongoose.Schema({
    time: Number,
    height: Number,
    tx_hash: String,
    memo: String,
    status: Number,
    log: String,
    complex_msg: Boolean,
    type: String,
    from: String,
    to: String,
    coins: Array,
    signer: String,
    events: Array,
    msgs: Array,
    signers: Array,
    addrs: Array,
}, { versionKey: false });

//	csrb 浏览器交易记录过滤正则表达式
function filterExTxTypeRegExp(): object {
    let RegExpStr:string = Cache.supportTypes.join('|');
    console.log('supportTypes:',RegExpStr);
    return new RegExp(RegExpStr || '//');
}

function filterTxTypeRegExp(types: TxType[]): object {
    if (!Array.isArray(types) || types.length === 0) return;
    let typeStr: string = ``;
    types.forEach((type: TxType) => {
        if (!typeStr) {
            typeStr = `${type}`;
        } else {
            typeStr += `|${type}`;
        }
    });
    return new RegExp(typeStr);
}


// 	txs
TxSchema.statics.queryTxList = async function(query: ITxsQuery): Promise<IListStruct> {
    let result: IListStruct = {};
    let queryParameters: ITxsQueryParams = {};
    if (query.type && query.type.length) {
        queryParameters['msgs.type'] = query.type;
    } else {
        queryParameters.$or = [{ 'msgs.type' : filterExTxTypeRegExp() }];
    }

    if (query.status && query.status.length) {
        switch (query.status) {
            case '1':
                queryParameters.status = TxStatus.SUCCESS;
                break;
            case '2':
                queryParameters.status = TxStatus.FAILED;
                break;
        }
    }
    if ((query.beginTime && query.beginTime.length) || (query.endTime && query.endTime.length)) {
        queryParameters.time = {};
    }
    if (query.beginTime && query.beginTime.length) {
        queryParameters.time.$gte = Number(query.beginTime);
    }
    if (query.endTime && query.endTime.length) {
        queryParameters.time.$lte = Number(query.endTime);
    }
    result.data = await this.find(queryParameters)
        .sort({ time: -1 })
        .skip((Number(query.pageNum) - 1) * Number(query.pageSize))
        .limit(Number(query.pageSize));
    if (query.useCount && query.useCount == true) {
        result.count = await this.find(queryParameters).countDocuments();
    }
    return result;
};

// 	txs/blocks
TxSchema.statics.queryTxWithHeight = async function(query: ITxsWithHeightQuery): Promise<IListStruct> {
    let result: IListStruct = {};
    let queryParameters: { height?: number, $or: object[] } = { $or: [{ 'msgs.type': filterExTxTypeRegExp() }] };
    if (query.height) {
        queryParameters.height = Number(query.height);
    }
    result.data = await this.find(queryParameters)
        .sort({ time: -1 })
        .skip((Number(query.pageNum) - 1) * Number(query.pageSize))
        .limit(Number(query.pageSize));
    if (query.useCount && query.useCount == true) {
        result.count = await this.find(queryParameters).countDocuments();
    }
    return result;
};

//  txs/addresses
TxSchema.statics.queryTxWithAddress = async function(query: ITxsWithAddressQuery): Promise<IListStruct> {
    let result: IListStruct = {};
    let queryParameters: any = {};
    if (query.address && query.address.length) {
        queryParameters = {
            // $or:[
            // 	{"from":query.address},
            // 	{"to":query.address},
            // 	{"signer":query.address},
            // ],
            addrs: { $elemMatch: { $eq: query.address } },
        };
    }
    if (query.type && query.type.length) {
        queryParameters['msgs.type'] = query.type;
    } else {
        queryParameters.$or = [{ 'msgs.type': filterExTxTypeRegExp() }];
    }
    if (query.status && query.status.length) {
        switch (query.status) {
            case '1':
                queryParameters.status = TxStatus.SUCCESS;
                break;
            case '2':
                queryParameters.status = TxStatus.FAILED;
                break;
        }
    }
    result.data = await this.find(queryParameters)
        .sort({ time: -1 })
        .skip((Number(query.pageNum) - 1) * Number(query.pageSize))
        .limit(Number(query.pageSize));
    if (query.useCount && query.useCount == true) {
        result.count = await this.find(queryParameters).countDocuments();
    }
    return result;
};

//  txs/relevance
TxSchema.statics.queryTxWithContextId = async function(query: ITxsWithContextIdQuery): Promise<IListStruct> {
    let result: IListStruct = {};
    let queryParameters: any = {};
    if (query.contextId && query.contextId.length) {
        queryParameters = {
            $or: [
                { 'events.attributes.value': query.contextId },
                { 'msgs.msg.ex.request_context_id': query.contextId },
                { 'msgs.msg.request_context_id': query.contextId },
            ],
        };
    }
    if (query.type && query.type.length) {
        queryParameters['msgs.type'] = query.type;
    } else {
        queryParameters.$or = [{ 'msgs.type': filterExTxTypeRegExp() }];
    }

    if (query.status && query.status.length) {
        switch (query.status) {
            case '1':
                queryParameters.status = TxStatus.SUCCESS;
                break;
            case '2':
                queryParameters.status = TxStatus.FAILED;
                break;
        }
    }
    result.data = await this.find(queryParameters)
        .sort({ time: -1 })
        .skip((Number(query.pageNum) - 1) * Number(query.pageSize))
        .limit(Number(query.pageSize));
    if (query.useCount && query.useCount == true) {
        result.count = await this.find(queryParameters).countDocuments();
    }
    return result;
};

//  txs/nfts
TxSchema.statics.queryTxWithNft = async function(query: ITxsWithNftQuery): Promise<IListStruct> {
    let result: IListStruct = {};
    const nftTypesList: TxType[] = [
        TxType.mint_nft,
        TxType.edit_nft,
        TxType.transfer_nft,
        TxType.burn_nft,
    ];
    let queryParameters: { denom?: string, tokenId?: string, $or: object[] } = { $or: [{ 'msgs.type': filterTxTypeRegExp(nftTypesList) }] };

    if (query.denom && query.denom.length) {
        queryParameters['msgs.msg.denom'] = query.denom;
    }
    if (query.tokenId && query.tokenId.length) {
        queryParameters['msgs.msg.id'] = query.tokenId;
    }
    result.data = await this.find(queryParameters)
        .sort({ time: -1 })
        .skip((Number(query.pageNum) - 1) * Number(query.pageSize))
        .limit(Number(query.pageSize));
    if (query.useCount && query.useCount == true) {
        result.count = await this.find(queryParameters).countDocuments();
    }
    return result;
};

//  txs/services
TxSchema.statics.queryTxWithServiceName = async function(query: ITxsWithServiceNameQuery): Promise<IListStruct> {
    let result: IListStruct = {};
    let queryParameters: any = {};
    if (query.serviceName && query.serviceName.length) {
        queryParameters = {
            $or: [
                { 'msgs.msg.service_name': query.serviceName },
                { 'msgs.msg.ex.service_name': query.serviceName },
                { 'msgs.type': filterExTxTypeRegExp() }
            ],
        };
    }
    result.data = await this.find(queryParameters)
        .sort({ time: -1 })
        .skip((Number(query.pageNum) - 1) * Number(query.pageSize))
        .limit(Number(query.pageSize));
    if (query.useCount && query.useCount == true) {
        result.count = await this.find(queryParameters).countDocuments();
    }
    return result;
};

//  txs/services/detail/{serviceName}
TxSchema.statics.queryTxDetailWithServiceName = async function(serviceName: string): Promise<ITxStruct> {
    return await this.findOne({ 'msgs.msg.name': serviceName, type: TxType.define_service });
};

// ==> txs/services/call-service
TxSchema.statics.queryCallServiceWithConsumerAddr = async function(consumerAddr: string, pageNum: string, pageSize: string, useCount: boolean): Promise<IListStruct> {
    let result: IListStruct = {};
    let queryParameters: any = {
        'msgs.msg.consumer': consumerAddr,
        type: TxType.call_service,
        status: TxStatus.SUCCESS,
    };
    result.data = await this.find(queryParameters)
        .sort({ time: -1 })
        .skip((Number(pageNum) - 1) * Number(pageSize))
        .limit(Number(pageSize));
    if (useCount && useCount == true) {
        result.count = await this.find(queryParameters).countDocuments();
    }
    return result;
};

// ==> txs/services/call-service
TxSchema.statics.queryRespondServiceWithContextId = async function(ContextId: string): Promise<ITxStruct[]> {
    return await this.find({ 'msgs.msg.ex.request_context_id': ContextId, type: TxType.respond_service });
};

// ==> txs/services/respond-service
TxSchema.statics.queryBindServiceWithProviderAddr = async function(ProviderAddr: string, pageNum: string, pageSize: string, useCount: boolean): Promise<IListStruct> {
    let result: IListStruct = {};
    let queryParameters: any = {
        'msgs.msg.provider': ProviderAddr,
        type: TxType.bind_service,
        status: TxStatus.SUCCESS,
    };
    result.data = await this.find(queryParameters)
        .sort({ time: -1 })
        .skip((Number(pageNum) - 1) * Number(pageSize))
        .limit(Number(pageSize));
    if (useCount && useCount == true) {
        result.count = await this.find(queryParameters).countDocuments();
    }
    return result;
};

// ==> txs/services/respond-service
TxSchema.statics.queryRespondCountWithServceName = async function(servceName: string, providerAddr: string): Promise<ITxStruct[]> {
    return await this.find({
        'msgs.msg.ex.service_name': servceName,
        'msgs.msg.provider': providerAddr,
        type: TxType.respond_service,
    }).countDocuments();
};

// ==> txs/services/respond-service
TxSchema.statics.querydisableServiceBindingWithServceName = async function(servceName: string, providerAddr: string): Promise<ITxStruct[]> {
    return await this.find({
        'msgs.msg.service_name': servceName,
        'msgs.msg.provider': providerAddr,
        type: TxType.disable_service_binding,
    })
        .sort({ time: -1 })
        .limit(1);
};


//  txs/{hash}
TxSchema.statics.queryTxWithHash = async function(hash: string): Promise<ITxStruct> {
    return await this.findOne({ tx_hash: hash });
};

//  /statistics
TxSchema.statics.queryTxStatistics = async function(): Promise<{ txCount: number, serviceCount: number }> {
    let txCount = await this.find().countDocuments();
    let serviceCount = await this.find({ type: TxType.define_service, status: TxStatus.SUCCESS }).countDocuments();
    return {
        txCount,
        serviceCount,
    };
};

//	获取指定条数的serviceName==null&&type == respond_service 的 tx
// TxSchema.statics.findRespondServiceTx = async function(pageSize?:number):Promise<ITxStructHash[]>{
// 	pageSize = pageSize || cfg.taskCfg.syncTxServiceNameSize;
// 	return await this.find({
// 							type:TxType.respond_service,
// 							'msgs.msg.ex.service_name':null
// 						},{tx_hash:1,'msgs.msg.request_id':1})
// 					 .sort({time:-1})
// 					 .limit(Number(pageSize));
// }

//	根据Request_Context_Id list && type == call_service 获取指定tx list
TxSchema.statics.findCallServiceTxWithReqContextIds = async function(reqContextIds: string[]): Promise<ITxStructMsgs[]> {
    if (!reqContextIds || !reqContextIds.length) {
        return [];
    }
    ;
    let query = {
        type: TxType.call_service,
        'events.attributes.key': 'request_context_id',
        'events.attributes.value': { $in: reqContextIds },
    };
    return await this.find(query, {
        'events.attributes': 1,
        'msgs.msg.service_name': 1,
        'msgs.msg.consumer': 1,
        'tx_hash': 1,
    });
};

//	根据Request_Context_Id list && type == call_service 获取指定tx list
// TxSchema.statics.updateServiceNameToResServiceTxWithTxHash = async function(txHash:string, serviceName:string, requestContextId:string, callHash: string, consumer: string):Promise<ITxStruct>{
// 	if (!txHash || !txHash.length) {return null};
// 	let query = {
// 		tx_hash:txHash,
// 	};
// 	let updateParams: any = {
// 	    $set: {
// 	        'msgs.0.msg.ex.service_name': serviceName,
//             'msgs.0.msg.ex.request_context_id': requestContextId,
//             'msgs.0.msg.ex.call_hash': callHash,
//             'msgs.0.msg.ex.consumer': consumer,
// 	    }
// 	};
// 	return await this.findOneAndUpdate(query,updateParams);
// }

//定时任务, 查询所有关于service的tx
TxSchema.statics.findAllServiceTx = async function(pageSize?: number): Promise<ITxStruct[]> {
    pageSize = pageSize || cfg.taskCfg.syncTxServiceNameSize;
    let queryParameters: any = {
        $or: [
            { 'type': TxType.define_service },
            { 'type': TxType.bind_service },
            { 'type': TxType.call_service },
            { 'type': TxType.respond_service },
            { 'type': TxType.update_service_binding },
            { 'type': TxType.disable_service_binding },
            { 'type': TxType.enable_service_binding },
            { 'type': TxType.refund_service_deposit },
            { 'type': TxType.pause_request_context },
            { 'type': TxType.start_request_context },
            { 'type': TxType.kill_request_context },
            { 'type': TxType.update_request_context },
        ],
        'msgs.msg.ex.service_name': null,
    };
    return await this.find(queryParameters).sort({ time: -1 }).limit(Number(pageSize));
};

//用request_context_id查询call_service的service_name
TxSchema.statics.queryServiceName = async function(requestContextId: string): Promise<string> {
    let queryParameters: any = {
        'type': TxType.call_service,
        'events.attributes.key': 'request_context_id',
        'events.attributes.value': requestContextId.toUpperCase(),
        'status': TxStatus.SUCCESS,
    };
    return await this.findOne(queryParameters);
};

//在msg结构中增加ex字段
TxSchema.statics.addExFieldForServiceTx = async function(ex: IExFieldQuery): Promise<string> {
    const { requestContextId, consumer, serviceName, callHash, hash, bind } = ex;
    let updateParams: any = {
        $set: {},
    };
    if (requestContextId && requestContextId.length) {
        updateParams['$set']['msgs.0.msg.ex.request_context_id'] = requestContextId;
    }
    if (consumer && consumer.length) {
        updateParams['$set']['msgs.0.msg.ex.consumer'] = consumer;
    }
    if (serviceName && serviceName.length) {
        updateParams['$set']['msgs.0.msg.ex.service_name'] = serviceName;
    }
    if (callHash && callHash.length) {
        updateParams['$set']['msgs.0.msg.ex.call_hash'] = callHash;
    }
    if (bind) {
        updateParams['$set']['msgs.0.msg.ex.bind'] = bind;
    }

    return await this.findOneAndUpdate({ tx_hash: hash }, updateParams);
};

//根据serviceName 查询define_service tx
TxSchema.statics.queryDefineServiceTxHashByServiceName = async function(serviceName: string): Promise<ITxStruct> {
    let queryParameters: any = {
        type: TxType.define_service,
        'msgs.msg.name': serviceName,
    };
    return await this.findOne(queryParameters, { 'tx_hash': 1 });
};


TxSchema.statics.findServiceAllList = async function(
    pageNum: number,
    pageSize: number,
    useCount: boolean | undefined,
    nameOrDescription?: string,
): Promise<ITxStruct> {

    const queryParameters: any = {
        type: TxType.define_service,
        status: TxStatus.SUCCESS,
    };
    if (nameOrDescription) {
        const reg = new RegExp(nameOrDescription, 'i');
        queryParameters['$or'] = [
            { 'msgs.msg.name': { $regex: reg } },
            { 'msgs.msg.description': { $regex: reg } },
        ];
    }
    return await this.find(queryParameters)
        .sort({
            'msgs.msg.ex.bind': -1,
            time: -1,
        })
        .skip((Number(pageNum) - 1) * Number(pageSize))
        .limit(Number(pageSize));
};


TxSchema.statics.findBindServiceTxList = async function(
    serviceName: IServiceName,
    pageNum?: number,
    pageSize?: number,
): Promise<ITxStruct> {
    const queryParameters: any = {
        type: TxType.bind_service,
        status: TxStatus.SUCCESS,
        'msgs.msg.service_name': serviceName,
    };
    if (pageNum && pageSize) {
        return await this.find(queryParameters)
            .sort({ 'time': -1 })
            .skip((Number(pageNum) - 1) * Number(pageSize))
            .limit(Number(pageSize));
    } else {
        return await this.find(queryParameters).sort({ 'time': -1 });
    }

};

//查询某个provider在某个service下所有的响应次数
TxSchema.statics.findProviderRespondTimesForService = async function(serviceName: string, provider: string): Promise<number> {
    const queryParameters: any = {
        type: TxType.respond_service,
        'msgs.msg.ex.service_name': serviceName,
        'msgs.msg.provider': provider,
    };
    return await this.countDocuments(queryParameters);
};

TxSchema.statics.findAllServiceCount = async function(nameOrDescription?: string): Promise<number> {
    const queryParameters: any = {
        type: TxType.define_service,
        status: TxStatus.SUCCESS,
    };
    if (nameOrDescription) {
        const reg = new RegExp(nameOrDescription, 'i');
        queryParameters['$or'] = [
            { 'msgs.msg.name': { $regex: reg } },
            { 'msgs.msg.description': { $regex: reg } },
        ];
    }
    return await this.countDocuments(queryParameters);
};

TxSchema.statics.findServiceProviderCount = async function(serviceName): Promise<number> {
    const queryParameters: any = {
        type: TxType.bind_service,
        status: TxStatus.SUCCESS,
        'msgs.msg.service_name': serviceName,
    };
    return await this.countDocuments(queryParameters);
};

TxSchema.statics.findServiceTx = async function(
    serviceName: string,
    type: string,
    status: number,
    pageNum: number,
    pageSize: number,
): Promise<ITxStruct> {
    const queryParameters: any = {
        'msgs.msg.ex.service_name': serviceName,
    };
    if (type) {
        queryParameters.type = type;
    }
    switch (status) {
        case 0:
            queryParameters.status = TxStatus.FAILED;
            break;
        case 1:
            queryParameters.status = TxStatus.SUCCESS;
            break;
        default:
            break;
    }
    return await this.find(queryParameters)
        .sort({ 'height': -1 })
        .skip((Number(pageNum) - 1) * Number(pageSize))
        .limit(Number(pageSize));
};

TxSchema.statics.findServiceTxCount = async function(serviceName: string, type: string, status: number): Promise<number> {
    const queryParameters: any = {
        'msgs.msg.ex.service_name': serviceName,
    };
    if (type) {
        queryParameters.type = type;
    }

    switch (status) {
        case 0:
            queryParameters.status = TxStatus.FAILED;
            break;
        case 1:
            queryParameters.status = TxStatus.SUCCESS;
            break;
        default:
            break;
    }
    return await this.countDocuments(queryParameters);
};

TxSchema.statics.findBindTx = async function(serviceName: string, provider: string): Promise<ITxStruct | null> {
    const queryParameters: any = {
        'msgs.msg.service_name': serviceName,
        'msgs.msg.provider': provider,
        type: TxType.bind_service,
        status: TxStatus.SUCCESS,
    };
    return await this.findOne(queryParameters);
};

TxSchema.statics.findServiceOwner = async function(serviceName: string): Promise<ITxStruct | null> {
    const queryParameters: any = {
        'msgs.msg.name': serviceName,
        type: TxType.define_service,
        status: TxStatus.SUCCESS,
    };
    return await this.findOne(queryParameters);
};


TxSchema.statics.queryServiceRespondTx = async function(serviceName: string, provider: string, pageNum: number, pageSize: number): Promise<ITxStruct[]> {
    const queryParameters: any = {
        type: TxType.respond_service,
    };
    if (serviceName && serviceName.length) {
        queryParameters['msgs.msg.ex.service_name'] = serviceName;
    }
    if (provider && provider.length) {
        queryParameters['msgs.msg.provider'] = provider;
    }
    return await this.find(queryParameters)
        .sort({ 'height': -1 })
        .skip((Number(pageNum) - 1) * Number(pageSize))
        .limit(Number(pageSize));
};

TxSchema.statics.findRespondServiceCount = async function(serviceName: string, provider: string): Promise<ITxStruct[]> {
    const queryParameters: any = {
        'msgs.msg.ex.service_name': serviceName,
        type: TxType.respond_service,
        status: TxStatus.SUCCESS,
    };
    if (provider) {
        queryParameters['msgs.msg.provider'] = provider;
    }
    return await this.countDocuments(queryParameters);
};

TxSchema.statics.queryDenomTx = async function(
    pageNum: number,
    pageSize: number,
    denomNameOrId?: string,
): Promise<ITxStruct[]> {
    const params = {
        type:TxType.issue_denom,
        status: TxStatus.SUCCESS
    };
    if (denomNameOrId) {
        params['$or'] = [
            { 'msgs.msg.id': denomNameOrId },
            { 'msgs.msg.name': denomNameOrId },
        ];
    }
    return await this.find(params)
        .skip((Number(pageNum) - 1) * Number(pageSize))
        .limit(Number(pageSize))
        .sort({time: -1});
};

TxSchema.statics.queryDenomTxCount = async function (denomNameOrId?: string,):Promise<ITxStruct[]>{
    const params = {
        type:TxType.issue_denom,
        status: TxStatus.SUCCESS
    };
    if (denomNameOrId) {
        params['$or'] = [
            { 'msgs.msg.id': denomNameOrId },
            { 'msgs.msg.name': denomNameOrId },
        ];
    }
    return await this.countDocuments(params);
};


TxSchema.statics.queryTxByDenom = async function(
    denom: string,
): Promise<ITxStruct | null> {
    const params = {
        type:TxType.issue_denom,
        status: TxStatus.SUCCESS,
        'msgs.msg.id': denom,
    };
    return await this.findOne(params);
};
TxSchema.statics.queryListByCreateAndUpDateIdentity = async function(
  height: number,
  limitSize:number,
):Promise<ITxStruct | null >{
    const params =  {
        height:{
            $gte:height
        },
        $or:[
            {
                'msgs.type': TxType.create_identity,
                status: TxStatus.SUCCESS,
            },
            {
                'msgs.type': TxType.update_identity,
                status: TxStatus.SUCCESS,
            }
        ]
    }
    return await this.find(params).limit(limitSize).sort({'update_block_height':-1})
}

TxSchema.statics.queryTxListByIdentity = async function (query:IIdentityTx){
    let result: IListStruct = {};
    const params =  {
        'msgs.msg.id':query.id,
        $or:[
            {
                'msgs.type': TxType.create_identity,
            },
            {
                'msgs.type': TxType.update_identity,
            }
        ]
    }
    result.data = await this.find(params)
      .sort({ time: -1 })
      .skip((Number(query.pageNum) - 1) * Number(query.pageSize))
      .limit(Number(query.pageSize));
    if (query.useCount && query.useCount == true) {
        result.count = await this.find(params).countDocuments();
    }
    return result;
}

