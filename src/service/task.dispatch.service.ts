import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ITaskDispatchEntities } from '../schema/task.dispatch.schema';
import { getIpAddress, getTimestamp } from '../util/util';

@Injectable()
export class TaskDispatchService {

    constructor(@InjectModel('TaskDispatch') private taskDispatchModel: Model<ITaskDispatchEntities>) {
    }

    async shouldExecuteCronJobs(name: string): Promise<boolean> {
        const task: any = await (this.taskDispatchModel as any).findOneByName(name);
        if (task) {
            if (task.is_locked) {
                return false;
            } else {
                const updated = await this.updateIsLockedBeginUpdateTimeAndDeviceIp(name);
                if (updated) {
                    return true;
                } else {
                    return false;
                }
            }
        } else {
            //it should be register if there is no this type of task;
            const registered = await this.registerTask(name);
            console.log('register successfully?', registered);
            if (registered) {
                const updated = await this.updateIsLockedBeginUpdateTimeAndDeviceIp(name);
                if (updated && updated.is_locked) {
                    return true;
                } else {
                    return false;
                }
            } else {
                new Logger().error(`${name} task has not been registered, but it couldn't register successfully!`);
                return false;

            }
        }
    }

    async registerTask(name: string): Promise<ITaskDispatchEntities> {
        const task: any = {
            name,
            is_locked: false,
            interval: 60000,// TODO(lsc) interval for different type of task need to be configured;
            device_ip: getIpAddress(),
            create_time: getTimestamp(),
            begin_update_time: 0,
            updated_time: 0,
        };
        return await (this.taskDispatchModel as any).createOne(task);
    }

    async updateIsLockedBeginUpdateTimeAndDeviceIp(name: string): Promise<ITaskDispatchEntities> {
        return await (this.taskDispatchModel as any).updateIsLockedBeginUpdateTimeAndDeviceIp(name);
    }

    async updateUpdatedTimeAndIsLocked(name: string) {
        return await (this.taskDispatchModel as any).updateUpdatedTimeAndIsLocked(name);
    }


}

