import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ITaskDispatch, ITaskDispatchStruct } from '../types/schemaTypes/task.dispatch.interface';
import { getIpAddress, getTimestamp } from '../util/util';
import { TaskEnum, TaskInterval } from '../constant';
import { cfg } from 'src/config';

@Injectable()
export class TaskDispatchService {

    constructor(@InjectModel('TaskDispatch') private taskDispatchModel: Model<ITaskDispatch>) {
        this.updateHeartbeatUpdateTime = this.updateHeartbeatUpdateTime.bind(this);
    }

    async needDoTask(name: TaskEnum): Promise<boolean> {
        const task: ITaskDispatchStruct | null = await (this.taskDispatchModel as any).findOneByName(name);
        if (task) {
            if (task.is_locked) {
                return false;
            } else {
                const updated = await this.lock(name);
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
                const updated = await this.lock(name);
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

    async registerTask(name: TaskEnum): Promise<ITaskDispatchStruct | null> {
        const task: ITaskDispatchStruct = {
            name,
            is_locked: false,
            interval: TaskInterval.get(name),
            device_ip: getIpAddress(),
            create_time: getTimestamp(),
            begin_update_time: 0,
            updated_time: 0,
            heartbeat_update_time: getTimestamp(),
        };
        return await (this.taskDispatchModel as any).createOne(task);
    }

    private async lock(name: TaskEnum): Promise<ITaskDispatchStruct | null> {
        return await (this.taskDispatchModel as any).lock(name);
    }

    async unlock(name: TaskEnum): Promise<ITaskDispatchStruct | null> {
        return await (this.taskDispatchModel as any).unlock(name);
    }

    async taskDispatchFaultTolerance(): Promise<boolean> {
        const taskList: ITaskDispatchStruct[] = await (this.taskDispatchModel as any).findAll();
        if (taskList && taskList.length > 0) {
            return new Promise(async (resolve) => {
                let arr: any[] = [];

                const promiseContainer = (task) => {
                    return new Promise(async (subRes) => {
                        //对比当前时间跟上次心跳更新时间的差额 与 心率, 当大于两个心率周期的时候, 任务上一个执行task的实例发生故障
                        if ((getTimestamp() - task.heartbeat_update_time) >= cfg.taskCfg.interval.heartbeatRate * 2) {
                            await this.releaseLockByName(task.name);
                            subRes();
                        } else {
                            subRes();
                        }
                    });

                };
                taskList.forEach((task) => {
                    arr.push(promiseContainer(task));
                });
                Promise.all(arr).then((res: any) => {
                    if (res) {
                        resolve(true);
                    }
                }).catch((e) => {
                    resolve(true);
                    new Logger('sync nft failed:', e.message);
                });
            });
        } else {
            return false;
        }
    }

    private async releaseLockByName(name: TaskEnum): Promise<ITaskDispatchStruct | null> {
        return await (this.taskDispatchModel as any).releaseLockByName(name);
    }

    public async updateHeartbeatUpdateTime(name: TaskEnum): Promise<void> {
        await (this.taskDispatchModel as any).updateHeartbeatUpdateTime(name);
    }


}

