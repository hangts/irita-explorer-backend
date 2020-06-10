import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {DenomTaskService} from './denom.task.service';
import { NftService } from '../service/nft.service';
import { TaskDispatchService } from '../service/task.dispatch.service';
import { taskEnum } from '../constant';
import { getIpAddress } from '../util/util';
import {cfg} from '../config';


@Injectable()
export class TasksService {
    private readonly logger = new Logger('from task service');


    constructor(
        private readonly denomTaskService: DenomTaskService,
        private readonly nftService: NftService,
        private readonly taskDispatchService: TaskDispatchService,
    ) {
    }

    @Cron(cfg.taskCfg.executeTime.denom)
    //@Cron('50 * * * * *')
    async syncDenoms() {
        this.handleDoTask(taskEnum.denom, this.denomTaskService.doTask);
    }

    @Cron(cfg.taskCfg.executeTime.nft)
    //@Cron('58 * * * * *')
    async syncNfts() {
        this.handleDoTask(taskEnum.nft, this.nftService.doTask);
    }

    @Cron(cfg.taskCfg.executeTime.faultTolerance)
    //@Cron('18 * * * * *')
    async taskDispatchFaultTolerance() {
        this.logger.log('cron jobs of fault tolerance is running');
        this.taskDispatchService.taskDispatchFaultTolerance();
    }

    async handleDoTask(taskName: taskEnum, doTaskCb) {
        const doTask: boolean = await this.taskDispatchService.needDoTask(taskName);
        this.logger.log(`the ip ${getIpAddress()} should do task ${taskName}? ${doTask}`);
        if (doTask) {
            const beginTime: number = new Date().getTime();
            const completed: boolean = await doTaskCb();
            this.logger.log(`${taskName} successfully it took ${new Date().getTime() - beginTime}ms, and release the lock!`);
            if (completed) {
                this.taskDispatchService.unlock(taskName);
            }
        }
    }


}