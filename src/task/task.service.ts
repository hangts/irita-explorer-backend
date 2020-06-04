import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DenomService } from '../service/denom.service';

@Injectable()
export class TasksService {
    private readonly logger = new Logger('from task service');

    constructor(private readonly denomService: DenomService) {
    }

    @Cron('30 * * * * *')
    handleCron() {
        this.logger.log('cron jobs is running!');
    }

    @Cron('01 * * * * *')
    syncDenoms() {
        this.logger.log('cron jobs of denoms async is running!');
        //this.denomService.async();
    }


}