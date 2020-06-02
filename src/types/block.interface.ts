import { IQueryBase } from '.';
import { Document } from 'mongoose';



export interface IBlockEntities extends Document {
    height:number,
    hash:string,
    txn:number,
    time:string,
}

export interface IBlockQueryParams extends IQueryBase {
}

export interface IBlock extends IBlockEntities{
}