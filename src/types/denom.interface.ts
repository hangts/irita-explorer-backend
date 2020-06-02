import { IQueryBase } from '.';
import { Document } from 'mongoose';



export interface IDenom extends Document {
    name:string;
    json_schema:string;
    creator:string;
}

export interface IDenomQueryParams extends IQueryBase {
}