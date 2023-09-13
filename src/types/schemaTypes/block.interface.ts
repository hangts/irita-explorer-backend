import { Document } from 'mongoose';

export interface IBlockStruct {
    dbHeight?:number,
    height?:number,
    hash?:string,
    txn?:number,
    time?:string,
    proposer?: string,
    total_validator_num?: number;
    total_voting_power?: number;
    precommit_voting_power?: number;
    precommit_validator_num?: number;
    proposer_moniker?: string;
    proposer_addr?: string;
    gas_used?: string;
}

export interface IBlock extends IBlockStruct, Document {
    
}