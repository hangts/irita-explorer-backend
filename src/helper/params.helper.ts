import {
  ITxsQuery,
  ITxsWithAddressQuery,
  ITxsWithContextIdQuery,
  ITxsWithNftQuery,
  IIdentityTx,
  ITxsWithAssetQuery,
  ITXWithIdentity,
} from '../types/schemaTypes/tx.interface';
import { TxStatus,TxType } from '../constant';
import { ITxsQueryParams } from '../types/tx.interface';
import {
  stakingTypes,
  declarationTypes,
  govTypes,
  coinswapTypes
} from '../helper/txTypes.helper';
import Cache from '../helper/cache';

export function txListParamsHelper(query: ITxsQuery){
  const queryParameters: ITxsQueryParams = {};
  if (query.type && query.type.length) {
      queryParameters['msgs.type'] = query.type;
  } else {
      queryParameters['msgs.type'] = {'$in': Cache.supportTypes || []};
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
  if (query.address && query.address.length) {
      queryParameters['addrs'] = { $elemMatch: { $eq: query.address } };
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
  return queryParameters
}

export function StakingTxListParamsHelper(query: ITxsQuery){
  const queryParameters: any = {};
  if (query.type && query.type.length) {
      queryParameters['msgs.type'] = query.type;
  } else {
      queryParameters['msgs.type'] = {'$in':stakingTypes()};
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
  if (query.address && query.address.length) {
      queryParameters['addrs'] = { $elemMatch: { $eq: query.address } };
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
  return queryParameters
}

export function CoinswapTxListParamsHelper(query: ITxsQuery){
  const queryParameters: any = {};
  const { type } = query;
  if (query.type && query.type.length) {
      const typeArr = type.split(",");
      queryParameters['msgs.type'] = {
          $in: typeArr
      }
  } else {
      queryParameters['msgs.type'] = {'$in':coinswapTypes()};
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
  if (query.address && query.address.length) {
      queryParameters['addrs'] = { $elemMatch: { $eq: query.address } };
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
  return queryParameters
}

export function DeclarationTxListParamsHelper(query: ITxsQuery){
  const queryParameters: any = {};
  if (query.type && query.type.length) {
      queryParameters['msgs.type'] = query.type;
  } else {
      queryParameters['msgs.type'] = { '$in': declarationTypes() };
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
  if (query.address && query.address.length) {
      queryParameters['addrs'] = { $elemMatch: { $eq: query.address } };
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
  return queryParameters
}

export function GovTxListParamsHelper(query: ITxsQuery){
  const queryParameters: any = {};
  if (query.type && query.type.length) {
      queryParameters['msgs.type'] = query.type;
  } else {
      queryParameters['msgs.type'] = { '$in': govTypes() };
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
  if (query.address && query.address.length) {
      queryParameters['addrs'] = { $elemMatch: { $eq: query.address } };
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
  return queryParameters
}

export function TxListEdgeParamsHelper(types, gt_height, status, address, include_event_addr){
  const queryParameters: any = {};
  if (types && types.length) {
      queryParameters['msgs.type'] = {'$in':types.split(',')};
  }
  if (gt_height) {
      queryParameters['height'] = {'$gt':gt_height};
  }
  if (status || status === 0) {
      queryParameters['status'] = status;
  }
  if (include_event_addr && include_event_addr == true && address && address.length) {
      queryParameters['$or'] = [
          { 'events.attributes.value': address },
          { 'addrs': { $elemMatch: {'$in': address.split(',')} }}
      ]
  } else if (address && address.length) {
      queryParameters['addrs'] = { $elemMatch: { '$in': address.split(',') } };
  }
  return queryParameters
}

export function TxWithAddressParamsHelper(query: ITxsWithAddressQuery){
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
      // queryParameters.$or = [{ 'msgs.type': filterExTxTypeRegExp() }];
      queryParameters['msgs.type'] = {
          $in: Cache.supportTypes || []
      }
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
  return queryParameters
}

export function TxWithContextIdParamsHelper(query: ITxsWithContextIdQuery){
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
      // queryParameters.$or = [{ 'msgs.type': filterExTxTypeRegExp() }];
      queryParameters['msgs.type'] = {
          $in: Cache.supportTypes || []
      }
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
  return queryParameters
}

export function queryTxWithNftHelper(query: ITxsWithNftQuery){
  const nftTypesList = [
    TxType.mint_nft,
    TxType.edit_nft,
    TxType.transfer_nft,
    TxType.burn_nft,
  ];
  // let queryParameters: { 'msgs.msg.denom'?: string, 'msgs.msg.id'?: string, $or: object[] } = { $or: [{ 'msgs.type': filterTxTypeRegExp(nftTypesList) }] };
  const queryParameters: { 'msgs.msg.denom'?: string, 'msgs.msg.id'?: string, 'msgs.type': object } = { 'msgs.type': { $in: nftTypesList || [] }};
  if (query.denomId && query.denomId.length) {
      queryParameters['msgs.msg.denom'] = query.denomId;
  }
  if (query.tokenId && query.tokenId.length) {
      queryParameters['msgs.msg.id'] = query.tokenId;
  }
  return queryParameters
}

export function queryTxListByIdentityHelper(query: IIdentityTx){
  const typesList: TxType[] = [
    TxType.create_identity,
    TxType.update_identity
  ];
  const params =  {
      'msgs.msg.id':query.id,
      // $or:[
      //     {
      //         'msgs.type': TxType.create_identity,
      //     },
      //     {
      //         'msgs.type': TxType.update_identity,
      //     }
      // ],
      'msgs.type': {
          $in: typesList
      }
  }
  return params
}

export function queryTxWithAssetCountHelper(query: ITxsWithAssetQuery){
  const queryParameters: {'msgs.type':string,'msgs.msg.symbol'?:string} = {
    'msgs.type': query.type,
  };
  if (query.symbol) {
      queryParameters['msgs.msg.symbol'] = query.symbol;
  }
  return queryParameters
}


export function queryIdentityListHelper(query: ITXWithIdentity){
  const queryParameters: any = {};
  if(query.search && query.search !== ''){
    //单条件模糊查询使用$regex $options为'i' 不区分大小写
    queryParameters.$or = [
      {identities_id:{ $regex: query.search,$options:'i' }},
      {owner:{ $regex: query.search,$options:'i' }}
    ]
  }
  return queryParameters
}

export function findListHelper(denomId, nftId, owner){
  const queryParameters:any = {};
  if (denomId || nftId || owner) {
      if (denomId) queryParameters.denom_id = denomId;
      if (nftId) queryParameters['$or']= [
          {'nft_name': nftId},
          {'nft_id': nftId},
      ];
      if (owner) queryParameters.owner = owner;
      // condition.push({'$match': queryParameters});
  }
  return queryParameters
}

export function queryVoteByTxhashsAndAddressHelper(hash, address){
  const queryParameters =  {
    'tx_hash': {
        $in: hash
    },
    status: TxStatus.SUCCESS,
    'msgs.msg.voter': {
        $in: address
    }
  }
  return queryParameters
}

export function queryDepositorByIdHelper(id){
  const queryParameters =  {
    'msgs.type': { $in: [TxType.deposit, TxType.submit_proposal] },
    $or: [
        { 'msgs.msg.proposal_id': Number(id) },
        { 'events.attributes.key': 'proposal_id', 'events.attributes.value': String(id) }
    ],
    status:TxStatus.SUCCESS 
}
  return queryParameters
}







