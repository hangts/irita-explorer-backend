import * as mongoose from 'mongoose'

export const ContractEnsReverseRegistrationSchema = new mongoose.Schema({
    contract_addr: String,
    addr: String,
    lower_addr: String,
    owner: String,
    resolver: String,
    name: String,
    is_valid_domain: Number,
    latest_tx_hash: String,
    latest_evm_tx_hash: String,
    latest_tx_height: Number,
    latest_tx_time: Number,
    create_time: Number,
    update_time: Number,
})

ContractEnsReverseRegistrationSchema.statics = {

    async findInAddr(addrs: string[]) {
        return await this.find({'lower_addr': {'$in':addrs}})
    },

};