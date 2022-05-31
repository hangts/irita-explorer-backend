import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ValidatorSchema } from '../schema/validators.schema';
import { ValidatorsTaskService } from "../task/validators.task.service"
import { ValidatorsHttp } from '../http/lcd/validators.http';
import {
  CronTaskWorkingStatusMetric,
  CronTaskWorkingStatusProvider
} from "../monitor/metrics/cron_task_working_status.metric";

@Module({
  imports:[
    MongooseModule.forFeature([
      {
        name:'SyncValidators',
        schema:ValidatorSchema,
        collection:'ex_sync_validator'
      }
    ])
  ],
  providers:[ ValidatorsTaskService, ValidatorsHttp, CronTaskWorkingStatusMetric, CronTaskWorkingStatusProvider()],
  exports: [ ValidatorsTaskService ]
})
export class ValidatorTaskModule {}
