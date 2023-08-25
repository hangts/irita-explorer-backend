import * as mongoose from 'mongoose'
import {queryDomainHelper} from "../helper/params.helper";

export const ContractEnsReverseRegistrationSchema = new mongoose.Schema({
    contract_addr: String,
    common_addr: String,
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

    async findInAddr(addrs: string[], commonAddrs: string[], resolver: string) {
        const query = queryDomainHelper(addrs, commonAddrs, resolver)

        return await this.find(query, {
            contract_addr: 1,
            common_addr: 1,
            addr: 1,
            lower_addr: 1,
            resolver: 1,
            name: 1
        })
    },

};