import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TasksService {
    private readonly logger = new Logger('from task service');

    @Cron('30 * * * * *')
    handleCron() {
        this.logger.log('cron jobs is running!');
    }
}