import * as mongoose from 'mongoose';
import {IProposalVoter} from "../types/schemaTypes/proposal.voter.interface";
import {PagingReqDto} from "../dto/base.dto";

export const ProposalVoterSchema = new mongoose.Schema({
    proposal_id: Number,
    voter: String,
    is_validator: Boolean,
    weighted_vote: Object,
    tx_hash: String,
    height: Number,
    vote_time: Number,
    yes_voting_power: Number,
    abstain_voting_power: Number,
    no_voting_power: Number,
    no_with_veto_voting_power: Number,
    is_effective: Boolean,
    create_time: Number,
    update_time: Number,
})
//ProposalSchema.index({id: 1}, {unique: true})

ProposalVoterSchema.statics = {
    async queryByAddress(address: string, query?: PagingReqDto): Promise<IProposalVoter> {
        if (query) {
            return await this.find({voter: address})
                .sort({vote_time: -1})
                .skip((Number(query.pageNum) - 1) * Number(query.pageSize))
                .limit(Number(query.pageSize));
        }else {
            return await this.find({voter: address}).sort({vote_time: -1})
        }
    },
}
