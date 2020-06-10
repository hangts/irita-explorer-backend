import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Logger } from '@nestjs/common';
import { getIpAddress, getTimestamp } from '../util/util';

export interface ITaskDispatchEntities extends Document {
    name: string,
    is_locked: boolean,
    interval: number,
    device_ip: string,
    create_time: number,
    begin_update_time: number,
    updated_time: number,

}

export const TaskDispatchSchema = new mongoose.Schema({
    name: String,
    is_locked: Boolean,
    interval: Number,
    device_ip: String,
    create_time: Number,
    begin_update_time: Number,
    updated_time: Number,
});

TaskDispatchSchema.statics = {
    async findOneByName(name: string): Promise<ITaskDispatchEntities[]> {
        return await this.findOne({ name }).exec();
    },

    async createOne(t: ITaskDispatchEntities): Promise<ITaskDispatchEntities[]> {
        return new this(t).save();
    },

    async lock(name: string): Promise<ITaskDispatchEntities> {
        return await this.updateOne({ name, is_locked: false }, {
            // condition: is_locked: false, those server whose query's is_locked is true should not to be updated;
            is_locked: true,
            begin_update_time: getTimestamp(),
            device_ip: getIpAddress(),
        }).exec();
    },

    async unlock(name: string): Promise<ITaskDispatchEntities> {
        return await this.updateOne({ name }, {
            is_locked: false,
            updated_time: getTimestamp(),
        }).exec();
    },

    async releaseLockByName(name: string): Promise<ITaskDispatchEntities> {
        return await this.updateOne({ name }, {
            is_locked: false,
        }).exec();
    },

    async findAllTask(): Promise<ITaskDispatchEntities[]> {
        return await this.find({}).exec();
    },


};