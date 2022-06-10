import { IdentitySchema } from '../schema/identity.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IdentityTaskService } from '../task/idnetity.task.service';
import { TxSchema } from '../schema/tx.schema';
import { PubkeySchema } from '../schema/pubkey.schema';
import { CertificateSchema } from '../schema/certificate.schema';
import { SyncTaskSchema } from '../schema/sync.task.schema';
import {
  CronTaskWorkingStatusMetric,
  CronTaskWorkingStatusProvider
} from "../monitor/metrics/cron_task_working_status.metric";
@Module({
  imports:[
    MongooseModule.forFeature([{
      name: 'Identity',
      schema: IdentitySchema,
      collection: 'ex_sync_identity'
    },{
      name: 'Tx',
      schema: TxSchema,
      collection: 'sync_tx'
    },{
      name: 'Pubkey',
      schema: PubkeySchema,
      collection: 'ex_sync_identity_pubkey'
    },{
      name:'Certificate',
      schema: CertificateSchema,
      collection:'ex_sync_identity_certificate'
    },{
      name: 'SyncTask',
      schema: SyncTaskSchema,
      collection: 'sync_task'
  }])
  ],
  providers:[IdentityTaskService, CronTaskWorkingStatusMetric, CronTaskWorkingStatusProvider()],
  exports:[IdentityTaskService]
})
export class IdentityTaskModule{}
