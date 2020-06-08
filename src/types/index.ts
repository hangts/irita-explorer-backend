export interface IQueryBase {
    pageNum?: string;
    pageSize?: string;
    useCount?: boolean;
}

export interface IListStructBase<T> {
    data?: T;
    pageNum?: number;
    pageSize?: number;
    count?: number;
}

export interface IResultBase {
    code: number;
    data?: any;
    message?: string;
}
