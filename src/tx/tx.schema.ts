import * as mongoose from 'mongoose';

export const TxSchema = new mongoose.Schema({
    id: String,
    time: String,
    height: Number,
    tx_hash: String,
    from: String,
    to: String,
    amount:[],
    type: String,
    fee:{
        amount:{
            amount:Number,
            denom: String,
        },
        gas: Number,
    },
    memo: String,
    status: String,
    code: Number,
    log: String,
    gas_used: Number,
    gas_wanted: Number,
    gas_price: Number,
    actual_fee:{
        amount:Number,
        denom: String,
    },
    proposal_id: Number,
    tags: {},
    signers: [],
    msgs:[],
    "txn-revno": Number,
    "txn-queue": [],
})