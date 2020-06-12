import { IQueryBase } from '.';
import { Document } from 'mongoose';

export interface ITxsQueryParams extends IQueryBase {
	type?:string,
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
