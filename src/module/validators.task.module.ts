import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ValidatorsModel } from '../schema/validators.schema';
import { ValidatorsTaskService } from "../task/validators.task.service"
import { ValidatorsHttp } from '../http/lcd/validators.http';

@Module({
  imports:[
    MongooseModule.forFeature([
      {
        name:'SyncValidators',
        schema:ValidatorsModel,
        collection:'ex_sync_validator'
      }
    ])
  ],
  providers:[ ValidatorsTaskService, ValidatorsHttp],
  exports: [ ValidatorsTaskService ]
})
export class ValidatorsTaskModule {}
