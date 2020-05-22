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

export interface txQueryParams {
    txType?: txType;
    status?: txStatus;
    beginTime?: number;
    endTime?: number;
}

export interface txPageParams {
    pageNumber: string,
    pageSize: string,
}