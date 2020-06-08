import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DenomService } from '../service/denom.service';
import { NftService } from '../service/nft.service';
import { TaskDispatchService } from '../service/task.dispatch.service';
import { taskEnum } from '../enum';
import { getIPAdress } from '../util/util';


@Injectable()
export class TasksService {
    private readonly logger = new Logger('from task service');


    constructor(
        private readonly denomService: DenomService,
        private readonly nftService: NftService,
        private readonly taskDispatchService: TaskDispatchService,
    ) {
    }

    @Cron('30 * * * * *')
    handleCron() {
        this.logger.log('cron jobs is running!');
    }

    @Cron('25 * * * * *')
    async syncDenoms() {
        this.logger.log('cron jobs of denoms async is running!');
        const shouldExecuteTask: boolean = await this.taskDispatchService.shouldExecuteCronJobs(taskEnum.denom);
        console.log(`the ip ${getIPAdress()} should update ? `, shouldExecuteTask);
        if (shouldExecuteTask) {
            const completed = await this.denomService.async();
            if(completed){
                this.taskDispatchService.updateUpdatedTimeAndIsLocked(taskEnum.denom);
            }
        }

    }

    @Cron('01 * * * * *')
    async syncNfts() {
        this.logger.log('cron jobs of nft async is running!');
        const shouldExecuteTask: boolean = await this.taskDispatchService.shouldExecuteCronJobs(taskEnum.nft);
       // if (shouldExecuteTask) {
            const completed = await this.nftService.findDenomAndSyncNft();
            if(completed){
                this.taskDispatchService.updateUpdatedTimeAndIsLocked(taskEnum.nft);
            }
        //}

    }
}