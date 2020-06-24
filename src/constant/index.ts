import { cfg } from '../config/config';

export enum TaskEnum {
    denom = 'ex_sync_denom',
    nft = 'ex_sync_nft',
    txServiceName = "sync_tx_service_name",
    validators = 'sync_validators',
}


export const DefaultPaging = {
    pageNum: 1,
    pageSize: 10,
};

export enum ENV {
    development = 'development',
    production = 'production',
};

export enum TxType {
    create_record = 'create_record',
    mint_token = 'mint_token',
    burn_nft = 'burn_nft',
    send = 'send',
    respond_service = 'respond_service',
    transfer_nft = 'transfer_nft',
    edit_nft = 'edit_nft',
    define_service = 'define_service',
    bind_service = 'bind_service',
    call_service = 'call_service',
    issue_denom = 'issue_denom',
    mint_nft = 'mint_nft',
    transfer_token_owner = 'transfer_token_owner',
    issue_token = 'issue_token',
    edit_token = 'edit_token',
}

export enum LoggerLevel {
    ALL = 'ALL',
    TRACE = 'TRACE',
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    FATAL = 'FATAL',
    MARK = 'MARK',
    OFF = 'OFF',
}