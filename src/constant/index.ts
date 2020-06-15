import { cfg } from '../config';

export enum TaskEnum {
    denom = 'sync_denom',
    nft = 'sync_nft',
    txServiceName = "sync_tx_service_name",
}

export const DefaultPaging = {
    pageNum: 1,
    pageSize: 10,
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