export interface IProposalVoter {
    proposal_id: number,
    voter: string,
    is_validator: boolean,
    weighted_vote: object,
    tx_hash: string,
    height: number,
    vote_time: number,
    yes_voting_power: number,
    abstain_voting_power: number,
    no_voting_power: number,
    no_with_veto_voting_power: number,
    is_effective: boolean,
    create_time: number,
    update_time: number,
}

export interface IGovProposalQuery {
    pageNum?: string;
    pageSize?: string;
    useCount?: boolean | string;
    status?: string;
}
