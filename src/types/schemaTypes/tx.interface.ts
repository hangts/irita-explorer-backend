import { IQueryBase } from '../index';

export interface ITxsQuery extends IQueryBase {
	type?:string,
	status?:string,
	beginTime?:string,
  	endTime?:string,
}

export interface ITxsWhthHeightQuery extends IQueryBase {
	height?:string,
}

export interface ITxsWhthAddressQuery extends IQueryBase {
	address?:string,
    type?:string,
    status?:string,
}

export interface ITxsWhthContextIdQuery extends IQueryBase {
    contextId?:string,
    type?:string,
    status?:string,
}

export interface ITxsWhthNftQuery extends IQueryBase {
	denom?:string,
	tokenId?:string,
}

export interface ITxsWhthServiceNameQuery extends IQueryBase {
	serviceName?:string,
}

export interface ITxStruct {
    time:number,
    height:number,
    tx_hash:string,
    memo:string,
    status:number,
    log:string,
    complex_msg:boolean,
    type:string,
    from:string,
    to:string,
    coins:object[],
    signer:string,
    events:object[],
    msgs:object[],
    signers:string[]
}

export interface ITxStructMsgs {
    events:object[],
    msgs:object[],
}

export interface ITxStructHash {
    tx_hash:object[],
    msgs:object[],
}