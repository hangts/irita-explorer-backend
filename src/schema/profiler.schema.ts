import * as mongoose from 'mongoose';

export const ProfilerSchema = new mongoose.Schema({
    address: String,
    create_time: Number,
    update_time: Number
})

ProfilerSchema.statics = {
    async queryProfileAddress() {
        await this.find({})
    }
}
