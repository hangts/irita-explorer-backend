import { IQueryBase } from '.';
import { Document } from 'mongoose';

export interface ITxsQueryParams extends IQueryBase {
	type?:string,
	$nor?:object[],
	status?:number,
	time?:{
		$gte?:number,
		$lte?:number,
	}
}

export interface IListStruct {
	data?: any[],
  count?: number
}
