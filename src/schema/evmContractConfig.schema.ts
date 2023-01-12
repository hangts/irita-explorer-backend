import * as mongoose from 'mongoose';

export const EvmContractConfigSchema = new mongoose.Schema({
    contract_type: Number,
    abi_content: String,
    contract_addr: String,
    tag_type: Number,
    contract_source_code: String,
    deployed_bytecode: String,
}, {versionKey: false});

//EvmContractConfigSchema.index({'address': -1}, {unique: true, background: true});

EvmContractConfigSchema.statics = {
    async queryAllContractCfgs() {
        return await this.find({}, {'contract_addr': 1, 'contract_type': 1, 'tag_type':1})
    },

    async queryAllByContractAddr(addrs: string[]) {
        return await this.find({'contract_addr': {'$in':addrs}}, {'contract_addr': 1, 'contract_type': 1, 'tag_type':1})
    },


    async queryContractAddrByContractType(type: number[]) {
        return await this.find({'contract_type': {'$in':type}}, {'contract_addr': 1, 'contract_type': 1, 'tag_type':1})
    },
};