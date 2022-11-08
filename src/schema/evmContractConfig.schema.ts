import * as mongoose from 'mongoose';

export const EvmContractConfigSchema = new mongoose.Schema({
    name: String,
    address: String,
    abi_content: String,
    type: Number,
}, {versionKey: false});

//EvmContractConfigSchema.index({'address': -1}, {unique: true, background: true});

EvmContractConfigSchema.statics = {
    async queryAllContractCfgs() {
        return await this.find({}, {'address': 1, 'type': 1})
    },
    async queryContractAddrByType(type) {
        return await this.findOne({'type':type}, {'address': 1, 'type': 1})
    },
};