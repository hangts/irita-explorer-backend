import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TxTaskService } from './tx.task.service';
import {DenomTaskService} from './denom.task.service';
import { NftTaskService } from './nft.task.service';
import { TaskDispatchService } from '../service/task.dispatch.service';
import { TaskEnum } from '../constant';
import { getIpAddress } from '../util/util';
import {cfg} from '../config';
import { TaskCallback } from '../types/task.interface';


@Injectable()
export class TasksService {
    private readonly logger = new Logger('from task service');

    private timer = null;

    constructor(
        private readonly denomTaskService: DenomTaskService,
        private readonly nftTaskService: NftTaskService,
        private readonly taskDispatchService: TaskDispatchService,
        private readonly txTaskService: TxTaskService,
    ) {
    }

    @Cron(cfg.taskCfg.executeTime.denom)
    //@Cron('50 * * * * *')
    async syncDenoms() {
        this.handleDoTask(TaskEnum.denom, this.denomTaskService.doTask);
    }

    @Cron(cfg.taskCfg.executeTime.nft)
    //@Cron('22 * * * * *')
    async syncNfts() {
        this.handleDoTask(TaskEnum.nft, this.nftTaskService.doTask);
    }

    @Cron(cfg.taskCfg.executeTime.txServiceName)
    async syncTxServiceName() {
        this.logger.log('cron jobs of service name async is running!');
        this.handleDoTask(TaskEnum.txServiceName, this.txTaskService.syncRespondServiceTxServiceName.bind(this.txTaskService));
    }

    @Cron(cfg.taskCfg.executeTime.faultTolerance)
    //@Cron('18 * * * * *')
    async taskDispatchFaultTolerance() {
        this.logger.log('cron jobs of fault tolerance is running');
        this.taskDispatchService.taskDispatchFaultTolerance();
    }

    async handleDoTask(taskName: TaskEnum, doTask:TaskCallback) {
        const needDoTask: boolean = await this.taskDispatchService.needDoTask(taskName);
        this.logger.log(`the ip ${getIpAddress()} should do task ${taskName}? ${needDoTask}`);
        if (needDoTask) {
            try {
                //因为一般情况下定时任务执行时间要小于心跳率, 为防止hearbeat_update_time一直不被更新,
                await this.updateHeartbeatUpdateTime(taskName);
                const beginTime: number = new Date().getTime();
                this.timer = setInterval(()=>{
                    this.updateHeartbeatUpdateTime(taskName);
                },cfg.taskCfg.interval.heartbeatRate);
                await doTask();
                //weather task is completed successfully, lock need to be released;
                await this.taskDispatchService.unlock(taskName);
                if(this.timer){
                    clearInterval(this.timer);
                }
                this.logger.log(`${taskName} successfully it took ${new Date().getTime() - beginTime}ms, and release the lock!`);
            }catch (e) {
                if(this.timer){
                    clearInterval(this.timer);
                }
            }



        }
    }

    async updateHeartbeatUpdateTime(name: TaskEnum): Promise<void>{
        await this.taskDispatchService.updateHeartbeatUpdateTime(name);
    }


}

