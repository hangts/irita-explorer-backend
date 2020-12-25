import * as mongoose from 'mongoose';
import {
    IGovProposalDetail
} from "../types/schemaTypes/proposal.detail.interface";
export const ProposalDetailSchema = new mongoose.Schema({
    id: String,
    tally_details: Object,
    create_time: Number,
    update_time: Number
})
ProposalDetailSchema.index({id: 1}, {unique: true})

ProposalDetailSchema.statics = {
    async queryAllProposalsDetail() {
        return await this.find({})
    },
    async insertProposalDetail(insertProposal:IGovProposalDetail) {
        let { id } = insertProposal
        const options = {upsert: true, new: false, setDefaultsOnInsert: true}
        await this.findOneAndUpdate({id}, insertProposal, options)
    },
}
