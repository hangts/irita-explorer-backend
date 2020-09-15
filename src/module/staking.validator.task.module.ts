import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {StakingValidatorSchema} from "../schema/staking.validator.schema";
import {StakingValidatorTaskService} from "../task/staking.validator.task.service";
import {StakingValidatorHttp} from "../http/lcd/staking.validator.http";


@Module({
  imports:[
    MongooseModule.forFeature([
      {
        name:'StakingSyncValidators',
        schema: StakingValidatorSchema,
        collection:'ex_staking_validator'
      }
    ])
  ],
  providers:[StakingValidatorTaskService,StakingValidatorHttp],
  exports:[StakingValidatorTaskService],
})

export class StakingValidatorTaskModule{}
