import {Module } from '@nestjs/common';
import {NftTaskService} from '../task/nft.task.service';
import { MongooseModule } from '@nestjs/mongoose';
import {NftSchema} from '../schema/nft.schema';
import { DenomSchema } from '../schema/denom.schema';
import { TxSchema } from '../schema/tx.schema';
import { SyncTaskSchema } from '../schema/sync.task.schema';
import {CronTaskWorkingStatusMetric,CronTaskWorkingStatusProvider} from "../monitor/metrics/cron_task_working_status.metric";
import {StatisticsSchema} from "../schema/statistics.schema";
@Module({
    imports:[
        MongooseModule.forFeature([{
            name: 'Nft',
            schema: NftSchema,
            collection: 'ex_sync_nft'
        },{
            name: 'Denom',
            schema: DenomSchema,
            collection: 'ex_sync_denom'
        },{
            name: 'Tx',
            schema: TxSchema,
            collection: 'sync_tx'
        },{
            name: 'SyncTask',
            schema: SyncTaskSchema,
            collection: 'sync_task'
        },{
          name: 'Statistics',
          schema: StatisticsSchema,
          collection: 'ex_statistics'
        }])
    ],
    providers:[NftTaskService, CronTaskWorkingStatusMetric, CronTaskWorkingStatusProvider()],
    exports:[NftTaskService]
})
export class NftTaskModule{}