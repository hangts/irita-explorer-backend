import { Document } from 'mongoose';

export interface IAccountStruct {
    address?: string,
    account_total?: number,
    total?: Object,
    balance?: Array<object>,
    delegation?: Object,
    unbonding_delegation?: Object,
    rewards?: Object,
    create_time?: number,
    update_time?: number,
    handled_block_height?: number,
}