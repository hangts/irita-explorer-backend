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
}

export interface ITxsWhthNftQuery extends IQueryBase {
	denom?:string,
	tokenId?:string,
}

export interface ITxsWhthServiceNameQuery extends IQueryBase {
	serviceName?:string,
}