import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
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


    constructor(
        private readonly denomTaskService: DenomTaskService,
        private readonly nftTaskService: NftTaskService,
        private readonly taskDispatchService: TaskDispatchService,
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
            const beginTime: number = new Date().getTime();
            await doTask();
            //weather task is completed successfully, lock need to be released;
            this.taskDispatchService.unlock(taskName);
            this.logger.log(`${taskName} successfully it took ${new Date().getTime() - beginTime}ms, and release the lock!`);

        }
    }


}