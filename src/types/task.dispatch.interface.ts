import { Document } from 'mongoose';

export interface ITaskDispatchEntities extends Document {
    name: string,
    is_locked: boolean,
    interval: number,
    device_ip: string,
    create_time: number,
    begin_update_time: number,
    updated_time: number,

}