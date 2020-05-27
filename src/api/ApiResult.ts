import { ErrorCodes } from './ResultCodes';
import { IResultBase, IListResponseBase } from '../types';


export class Result<T> implements IResultBase {
    public code: number = ErrorCodes.success;
    public data: T;

    constructor(data: T, code: number = ErrorCodes.success) {
        this.data = data;
        this.code = code;
    }
}

export class ListResult<T> implements IListResponseBase<T> {
    data: T;
    pageNumber: number;
    pageSize: number;
    count?: number;

    constructor(data: T, pageNumber: number, pageSize: number, count?: number) {
        this.data = data;
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
        if (count) this.count = count;
    }
}


