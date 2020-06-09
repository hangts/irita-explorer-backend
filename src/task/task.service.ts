import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DenomService } from '../service/denom.service';
import { NftService } from '../service/nft.service';
import { TaskDispatchService } from '../service/task.dispatch.service';
import { taskEnum } from '../enum';
import { getIpAddress } from '../util/util';


@Injectable()
export class TasksService {
    private readonly logger = new Logger('from task service');


    constructor(
        private readonly denomService: DenomService,
        private readonly nftService: NftService,
        private readonly taskDispatchService: TaskDispatchService,
    ) {
    }

    @Cron('10 * * * * *')
    async syncDenoms() {
        this.logger.log('cron jobs of denoms async is running!');
        const shouldExecuteTask: boolean = await this.taskDispatchService.shouldExecuteCronJobs(taskEnum.denom);
        this.logger.log(`the ip ${getIpAddress()} should update denom: ${shouldExecuteTask}`);
        if (shouldExecuteTask) {
            const beginTime: number = new Date().getTime();
            const completed: boolean = await this.denomService.async();
            this.logger.log(`denom sync successfully it took ${new Date().getTime() - beginTime}ms, and release the lock!`);
            if (completed) {
                this.taskDispatchService.updateUpdatedTimeAndIsLocked(taskEnum.denom);
            }
        }

    }

    @Cron('20 * * * * *')
    async syncNfts() {
        this.logger.log('cron jobs of nft async is running!');
        const shouldExecuteTask: boolean = await this.taskDispatchService.shouldExecuteCronJobs(taskEnum.nft);
        this.logger.log(`the ip ${getIpAddress()} should update nft: ${shouldExecuteTask}`);
        if (shouldExecuteTask) {
            const beginTime: number = new Date().getTime();
            const completed: boolean = await this.nftService.findDenomAndSyncNft();
            this.logger.log(`nft sync successfully it took ${new Date().getTime() - beginTime}ms, and release the lock!`);
            if (completed) {
                this.taskDispatchService.updateUpdatedTimeAndIsLocked(taskEnum.nft);
            }
        }

    }
}