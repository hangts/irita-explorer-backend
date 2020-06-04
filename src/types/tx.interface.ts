import { IQueryBase } from '.';
import { Document } from 'mongoose';

export interface ITxsQueryParams extends IQueryBase {
	type?:string,
	status?:number,
	time?:{
		$gte?:Date,
		$lte?:Date,
	},
}

export interface ITxsQuery extends IQueryBase {
	type?:string,
	status?:string,
	beginTime?:string,
  	endTime?:string,
}
