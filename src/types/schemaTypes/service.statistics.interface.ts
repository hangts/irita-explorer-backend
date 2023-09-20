import {TxStatus, TxType} from "../../constant";

export interface IServiceStatisticsStruct {
    service_name?: string,
    provider?: string,
    count?: number,
    create_time?: number,
    update_time?: number,
}


export interface IQueryParams {
    service_name?: string,
    type?: string | { $in: TxType[] },
    status?: number | { $in: TxStatus[] };
}
