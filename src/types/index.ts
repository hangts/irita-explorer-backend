export interface IQueryBase {
    pageNumber?: string;
    pageSize?: string;
    useCount?: boolean;
}

export interface IListStructBase<T> {
    data?: T;
    pageNumber?: number;
    pageSize?: number;
    count?: number;
}

export interface IResultBase {
    code: number;
    data?: any;
    message?: string;
}
