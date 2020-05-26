import {IQueryBase} from '../../types';

export enum txType {
    AllType = '',
    Transfer = 'Transfer',
    Burn = 'Burn',
    SetMemoRegexp = 'SetMemoRegexp'
}

export enum txStatus {
    success = 'success',
    failed = 'failed',
}


export interface ITxQueryParams extends IQueryBase{}