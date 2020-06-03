import { IQueryBase } from '.';
import { Document } from 'mongoose';

export interface IDenom extends Document {
    name:string;
    json_schema:string;
    creator:string;
}

export interface ITxsQueryParams extends IQueryBase {
	type?:string,
	status?:number,
	time?:{
		$gte?:Date,
		$lte?:Date,
	},

}