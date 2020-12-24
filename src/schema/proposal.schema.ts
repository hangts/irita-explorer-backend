import * as mongoose from 'mongoose';
export const ProposalSchema = new mongoose.Schema({
    id: String,
    content: Object,
    status: String,
    final_tally_result: Object,
    current_tally_result: Object,
    submit_time	: Number,
    deposit_end_time: Number,
    total_deposit: Object,
    initial_deposit: Object,
    voting_start_time: Number,
    voting_end_time: Number,
    proposer: String,
    is_deleted: Boolean,
    min_deposit: String,
    quorum: String,
    threshold: String,
    veto_threshold: String
})
ProposalSchema.index({id: 1}, {unique: true})

ProposalSchema.statics = {
    async queryAllProposals() {
        return await this.find({})
    },
    async updateProposals(ids) {
        return await this.updateMany({id: { $in: ids } }, {$set: {is_deleted: true}})
    },
}
