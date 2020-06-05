import { IQueryBase } from '.';
import { Document } from 'mongoose';



export interface INft extends Document {
    name:string;
    json_schema:string;
    creator:string;
}

export interface INftQueryParams extends IQueryBase {}