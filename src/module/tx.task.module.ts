import {Module } from '@nestjs/common';
import {TxTaskService} from '../task/tx.task.service';
import { MongooseModule } from '@nestjs/mongoose';
import {TxSchema} from '../schema/tx.schema';
import {
    CronTaskWorkingStatusMetric,
    CronTaskWorkingStatusProvider
} from "../monitor/metrics/cron_task_working_status.metric";
import {ServiceStatisticsSchema} from "../schema/service.statistics.schema";

@Module({
    imports:[
        MongooseModule.forFeature([{
            name: 'Tx',
            schema: TxSchema,
            collection: 'sync_tx'
        },
        {
            name: 'ServiceStatistics',
            schema: ServiceStatisticsSchema,
            collection: 'ex_service_statistics'
        }])
    ],
    providers:[TxTaskService, CronTaskWorkingStatusMetric, CronTaskWorkingStatusProvider()],
    exports:[TxTaskService]
})
export class TxTaskModule{}