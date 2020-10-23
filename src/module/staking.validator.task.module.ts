import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {StakingValidatorSchema} from "../schema/staking.validator.schema";
import {StakingValidatorTaskService} from "../task/staking.validator.task.service";
import {StakingHttp} from "../http/lcd/staking.http";
import {ParametersSchema} from "../schema/parameters.schema";
import {ParametersTaskService} from "../task/parameters.task.service";
import {TokenScaleHttp} from "../http/lcd/token.scale.http";
import {BlockHttp} from "../http/lcd/block.http";


@Module({
  imports:[
    MongooseModule.forFeature([
      {
        name:'StakingSyncValidators',
        schema: StakingValidatorSchema,
        collection:'ex_staking_validator'
      },
      {
        name:'ParametersTask',
        schema: ParametersSchema,
        collection:'ex_sync_parameters'
      },
    ])
  ],
  providers:[StakingValidatorTaskService,ParametersTaskService,StakingHttp,TokenScaleHttp,BlockHttp],
  exports:[StakingValidatorTaskService,ParametersTaskService],
})

export class StakingValidatorTaskModule{}
