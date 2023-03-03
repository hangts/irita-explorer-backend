export interface IGovProposal {
    id: string,
    tx_hash_submit_proposal: string,
    proposer: string,
    type: object,
    title: string,
    description: string,
    messages: object,
    status: number,
    final_tally_result: object,
    vote_count: object,
    initial_deposit: object,
    total_deposit: object,
    submit_time: number,
    deposit_end_time: number,
    voting_start_time: number,
    voting_end_time: number,
    metadata: string,
    min_deposit: object,
    quorum: string,
    threshold: string,
    veto_threshold: string,
    settlement_status: number,
    is_deleted: boolean,
    create_time: number,
    update_time: number
}

export interface IGovProposalQuery {
    pageNum?: string;
    pageSize?: string;
    useCount?: boolean | string;
    status?: string;
}
