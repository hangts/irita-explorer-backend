import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TxTaskService } from './tx.task.service';

@Injectable()
export class TasksService {
    private readonly logger = new Logger('from task service');
    constructor(
        private readonly txTaskService: TxTaskService,
    ) {}

    @Cron('05 * * * * *')
    async syncTxServiceName() {
        this.logger.log('cron jobs of nft async is running!');
        this.txTaskService.syncRespondServiceTxServiceName();
       //  const shouldExecuteTask: boolean = await this.taskDispatchService.shouldExecuteCronJobs(taskEnum.nft);
       // if (shouldExecuteTask) {
       //      const completed = await this.nftService.findDenomAndSyncNft();
       //      if(completed){
       //          this.taskDispatchService.updateUpdatedTimeAndIsLocked(taskEnum.nft);
       //      }
       //  }

    }



}
