import * as mongoose from 'mongoose';
export const TaskSchema = new mongoose.Schema({
    start_height: Number,
    end_height: Number,
    current_height: Number,
    status: String,
    worker_id: String,
    worker_logs: Object,
    last_update_time: Number,
})

TaskSchema.statics = {
    async queryTaskStatus() {
        let count:number = await this.find({'end_height':0,'status':'underway'}).countDocuments()
        return count > 0
    }
}
