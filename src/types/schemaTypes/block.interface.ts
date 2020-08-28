import { Document } from 'mongoose';

export interface IBlockStruct {
    height?:number,
    hash?:string,
    txn?:number,
    time?:string,
}

export interface IBlock extends IBlockStruct, Document {
    
}