import { ErrorCodes } from './ResultCodes';
import { IResultBase, IListStructBase } from '../types';
import {
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { GovVoterStatistical } from '../types/gov.interface'
export class ListStruct<T> implements IListStructBase<T> {
    data: T;
    pageNum: number;
    pageSize: number;
    count?: number;
    statistical?: GovVoterStatistical;
    total_tx_msgs?: number;
    last_update_time?: number;
    constructor(data: T,pageNum: number, pageSize: number, count?: number,statistical?:GovVoterStatistical,totalTxMsgs?:number, lastUpdateTime?:number) {
        this.data = data;
        this.pageNum = pageNum;
        this.pageSize = pageSize;
        if (count || count === 0) this.count = count;
        if (totalTxMsgs || totalTxMsgs === 0) this.total_tx_msgs = totalTxMsgs;
        if (statistical) this.statistical = statistical;
        if (lastUpdateTime) this.last_update_time = lastUpdateTime
    }
}

export class Result<T> implements IResultBase {
    public code: number = ErrorCodes.success;
    public data: T;

    constructor(data: T, code: number = ErrorCodes.success) {
        this.data = data;
        this.code = code;
    }
}

export class ApiError extends HttpException{
    constructor(code: number, message?: string){
        super({
            code,
            message,
        }, HttpStatus.OK)
    }
}




