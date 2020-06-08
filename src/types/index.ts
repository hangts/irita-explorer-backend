export interface IQueryBase {
    pageNumber?: string;
    pageSize?: string;
    useCount?: boolean | string;
}

export interface IListStructBase<T> {
    data?: T;
    pageNumber?: number;
    pageSize?: number;
    count?: number;
}

export interface IListStruct {
    data?: any[],
    count?: number
}

export interface IResultBase {
    code: number;
    data?: any;
    message?: string;
}
