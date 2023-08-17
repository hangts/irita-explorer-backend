import * as mongoose from 'mongoose'

export const ContractEnsTokenSchema = new mongoose.Schema({
    contract_addr: String,
    token_id: String,
    parent_node: String,
    domain_name: String,
    label: String,
    owner: String,
    resolver: Number,
    ttl: Number,
    expiry: Number,
    issue_tx_time: Number,
    issue_tx_hash: String,
    issue_tx_height: Number,
    issue_evm_tx_hash: String,
    create_time: Number,
    update_time: Number,
})

ContractEnsTokenSchema.statics = {

    async findInDomainName(names: string[]) {
        return await this.find({'domain_name': {'$in':names}})
    },

};