import * as mongoose from 'mongoose';
import {IGovProposal, IGovProposalQuery} from "../types/schemaTypes/proposal.interface";
import {ListStruct} from "../types";
import {queryProposalsCountHelper} from '../helper/params.helper';

export const ProposalSchema = new mongoose.Schema({
    id: Number,
    tx_hash_submit_proposal: String,
    proposer: String,
    type: Object,
    title: String,
    description: String,
    messages: Object,
    status: Number,
    final_tally_result: Object,
    vote_count: Object,
    initial_deposit: Object,
    total_deposit: Object,
    submit_time: Number,
    deposit_end_time: Number,
    voting_start_time: Number,
    voting_end_time: Number,
    metadata: String,
    min_deposit: Object,
    quorum: String,
    threshold: String,
    veto_threshold: String,
    settlement_status: Number,
    is_deleted: Boolean,
    create_time: Number,
    update_time: Number
})


ProposalSchema.statics = {
    async queryAllProposals() {
        return await this.find({is_deleted: false})
    },
    async updateProposals(ids) {
        return await this.updateMany({id: {$in: ids}}, {$set: {is_deleted: true}})
    },
    async insertProposal(insertProposal: IGovProposal) {
        const {id} = insertProposal
        const options = {upsert: true, new: false, setDefaultsOnInsert: true}
        await this.findOneAndUpdate({id}, insertProposal, options)
    },
    async queryProposals(query: IGovProposalQuery): Promise<ListStruct> {
        const queryParameters = queryProposalsCountHelper(query)
        const result: ListStruct = {}
        if (query.status) {
            result.data = await this.find(queryParameters).sort({id: -1});
        } else {
            result.data = await this.find(queryParameters)
                .sort({id: -1})
                .skip((Number(query.pageNum) - 1) * Number(query.pageSize))
                .limit(Number(query.pageSize));
        }
        return result
    },
    async queryProposalsCount(query: IGovProposalQuery): Promise<number> {
        const queryParameters = queryProposalsCountHelper(query)
        return await this.find(queryParameters).countDocuments();
    },
    async findOneById(id: number): Promise<IGovProposal> {
        return await this.findOne({'id': id})
    },
    async queryAllProposalsSelect() {
        return await this.find({}).select({_id: 0, id: 1, messages: 1, content: 1, is_deleted: 1})
    },
    async queryAllProposalsDeletedID() {
        return await this.find({is_deleted: 1}).select({_id: 0, id: 1})
    },
}
