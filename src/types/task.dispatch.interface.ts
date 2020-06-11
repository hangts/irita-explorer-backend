import { Document } from 'mongoose';

export interface ITaskDispatchStruct {
    name?: string,
    is_locked?: boolean,
    interval?: number,
    device_ip?: string,
    create_time?: number,
    begin_update_time?: number,
    updated_time?: number,
}

export interface ITaskDispatch extends ITaskDispatchStruct, Document {
}