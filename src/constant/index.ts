import { cfg } from '../config/config';

export enum TaskEnum {
    denom = 'ex_sync_denom',
    nft = 'ex_sync_nft',
    txServiceName = "sync_tx_service_name",
    validators = 'sync_validators',
    identity = 'sync_identity'
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
    // service
    define_service = 'define_service',
    bind_service = 'bind_service',
    call_service = 'call_service',
    respond_service = 'respond_service',
    update_service_binding = 'update_service_binding',
    disable_service_binding = 'disable_service_binding',
    enable_service_binding = 'enable_service_binding',
    refund_service_deposit = 'refund_service_deposit',
    pause_request_context = 'pause_request_context',
    start_request_context = 'start_request_context',
    kill_request_context = 'kill_request_context',
    update_request_context = 'update_request_context',
    create_record = 'create_record',
    // nft
    burn_nft = 'burn_nft',
    transfer_nft = 'transfer_nft',
    edit_nft = 'edit_nft',
    issue_denom = 'issue_denom',
    mint_nft = 'mint_nft',
    // Token
    issue_token = 'issue_token',
    edit_token = 'edit_token',
    mint_token = 'mint_token',
    transfer_token_owner = 'transfer_token_owner',
    //Bank
    send = 'send',
    multisend = 'multisend',
    //Crisis
    verify_invariant = 'verify_invariant',
    //Evidence
    submit_evidence = 'submit_evidence',
    //Staking
    begin_unbonding = 'begin_unbonding',
    edit_validator = 'edit_validator',
    create_validator = 'create_validator',
    delegate = 'delegate',
    begin_redelegate = 'begin_redelegate',
    // Slashing
    unjail = 'unjail',
    // Distribution
    set_withdraw_address = 'set_withdraw_address',
    withdraw_delegator_reward = 'withdraw_delegator_reward',
    withdraw_validator_commission = 'withdraw_validator_commission',
    fund_community_pool = 'fund_community_pool',
    // Gov
    deposit = 'deposit',
    vote = 'vote',
    submit_proposal = 'submit_proposal',
    // Coinswap
    add_liquidity = 'add_liquidity',
    remove_liquidity = 'remove_liquidity',
    swap_order = 'swap_order',
    // Htlc
    create_htlc = 'create_htlc',
    claim_htlc = 'claim_htlc',
    refund_htlc = 'refund_htlc',
    // Guardian
    add_profiler = 'add_profiler',
    delete_profiler = 'delete_profiler',
    add_trustee = 'add_trustee',
    delete_trustee = 'delete_trustee',
    // Oracle
    create_feed = 'create_feed',
    start_feed = 'start_feed',
    pause_feed = 'pause_feed',
    edit_feed = 'edit_feed',
    // IBC
    recv_packet = 'recv_packet',
    create_client = 'create_client',
    update_client = 'update_client',
    create_identity = 'create_identity',
    update_identity = 'update_identity',
}

export enum TxStatus {
    SUCCESS = 1,
    FAILED = 0,
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

