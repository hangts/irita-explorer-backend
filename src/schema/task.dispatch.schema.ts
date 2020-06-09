import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Logger } from '@nestjs/common';
import { getIpAddress } from '../util/util';

export interface ITaskDispatchEntities extends Document {
    name:string,
    is_locked:boolean,
    interval:number,
    device_ip:string,
    create_time:number,
    begin_update_time:number,
    updated_time:number,

}
export const TaskDispatchSchema = new mongoose.Schema({
    name:String,
    is_locked:Boolean,
    interval:Number,
    device_ip:String,
    create_time:Number,
    begin_update_time:Number,
    updated_time:Number,
});

TaskDispatchSchema.statics = {
    async findOneByName(name: string): Promise<ITaskDispatchEntities[]>{
        try{
            return await this.findOne({name}).exec();
        }catch (e) {
            new Logger().error('mongo-error:',e.message);
        }
    },

    async createOne(t: ITaskDispatchEntities): Promise<ITaskDispatchEntities[]>{
        try{
            return new this(t).save();
        }catch (e) {
            new Logger().error('mongo-error:',e.message);
        }
    },

    async updateIsLockedBeginUpdateTimeAndDeviceIp(name: string): Promise<ITaskDispatchEntities>{
        try{
            return await this.updateOne({name, is_locked:false},{
                // condition: is_locked: false, those server whose query's is_locked is true should not to be updated;
                is_locked:true,
                begin_update_time: Math.floor(new Date().getTime()/1000),
                device_ip:getIpAddress(),
            }).exec();
        }catch (e) {
            new Logger().error('mongo-error:',e.message);
        }
    },

    async updateUpdatedTimeAndIsLocked(name: string): Promise<ITaskDispatchEntities>{
        try{
            return await this.updateOne({name},{
                is_locked:false,
                updated_time: Math.floor(new Date().getTime()/1000),
            }).exec();
        }catch (e) {
            new Logger().error('mongo-error:',e.message);
        }
    }



};