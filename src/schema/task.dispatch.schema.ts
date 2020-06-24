import * as mongoose from 'mongoose';
import { getIpAddress, getTimestamp } from '../util/util';
import { ITaskDispatchStruct } from '../types/schemaTypes/task.dispatch.interface';
import { TaskEnum } from 'src/constant';
import { Logger } from '../log';

export const TaskDispatchSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    is_locked: Boolean,
    device_ip: String,
    create_time: Number,
    task_begin_time: Number,
    task_end_time: Number,
    heartbeat_update_time: Number,
},{versionKey: false});

TaskDispatchSchema.statics = {
    async findOneByName(name: TaskEnum): Promise<ITaskDispatchStruct | null> {
        return await this.findOne({ name }).exec();
    },

    async createOne(t: ITaskDispatchStruct): Promise<ITaskDispatchStruct | null> {
        return new this(t).save();
    },

    async lock(name: TaskEnum): Promise<ITaskDispatchStruct | null> {
        Logger.log(`From task.dispatch.schema ${name} task begin time: ${new Date().getTime()}`);
        return await this.updateOne({ name, is_locked: false }, {
            // condition: is_locked: false, those server whose query's is_locked is true should not to be updated;
            is_locked: true,
            task_begin_time: getTimestamp(),
            device_ip: getIpAddress(),
        }).exec();
    },

    async unlock(name: TaskEnum): Promise<ITaskDispatchStruct | null> {
        Logger.log(`From task.dispatch.schema ${name} task end time: ${new Date().getTime()}`);
        return await this.updateOne({ name }, {
            is_locked: false,
            task_end_time: getTimestamp(),
        }).exec();
    },

    async releaseLockByName(name: TaskEnum): Promise<ITaskDispatchStruct | null> {
        return await this.updateOne({
            name,
            is_locked:true
        }, {
            is_locked: false,
        }).exec();
    },

    async findAllLocked(): Promise<ITaskDispatchStruct[]> {
        return await this.find({is_locked:true}).exec();
    },

    async updateHeartbeatUpdateTime(name: TaskEnum): Promise<ITaskDispatchStruct | null> {
        return await this.updateOne({ name, is_locked: true }, {
            hearbeat_update_time: getTimestamp(),
        }).exec();
    },


};