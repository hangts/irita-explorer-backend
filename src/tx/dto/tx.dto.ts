import { Document } from 'mongoose';
import { IsString, IsInt } from 'class-validator';


interface IAmount {
    amount:number,
    denom: string,
}
interface IFee {
    amount:number,
    denom: string,
}

interface IMsgs<T> {
    msg:T,
    type: string,
}

interface IDelegation {
    amount: number,
    denom: string,
}

export interface IDelegateMsg {
    delegation: IDelegation,
    delegator_addr: string,
    validator_addr: string,
}
interface ICoins {
    amount: number,
    denom: string,
}
interface IInputs {
    address: string,
    coins: ICoins[],
}
interface IOutputs extends IInputs{}

export interface ITransferMsg {
    inputs: IInputs[],
    outputs: IOutputs[],
}

export interface IWithdrawDelegatorRewardAllMsg {
    validator_addr: string,
}
export interface IWithdrawDelegatorRewardMsg extends  IWithdrawDelegatorRewardAllMsg{
    delegator_addr: string,
}

interface ISigners {
    addr_hex: string;
    addr_bech32: string;
}


export class TxDto<T, R> {
    amount: IAmount[];
    block_height:number;
    fee:IFee;
    gas_limit: number;
    gas_price:number;
    gas_used: number;
    gas_wanted: number;
    hash: string;
    log: string;
    memo: string;
    msgs:IMsgs<T>[];
    signer: string;
    status: string;
    tags: R;
    timestamp: string;
    type: string;
    monikers: any;
}

export interface TxRepoDto<T, M> extends Document {
    id: string;
    time: string;
    height: number;
    tx_hash: string;
    from: string;
    to: string;
    amount:IAmount[];
    type: string;
    fee:{
        amount:IAmount,
        gas: number,
    };
    memo: string;
    status: string;
    code: number;
    log: string;
    gas_used: number;
    gas_wanted: number;
    gas_price: number;
    actual_fee:IFee;
    proposal_id: number;
    tags: T;
    signers: ISigners[];
    msgs:IMsgs<M>[];
    "txn-revno": number;
    "txn-queue": string[];
}