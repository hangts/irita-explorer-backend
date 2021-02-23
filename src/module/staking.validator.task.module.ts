import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {StakingValidatorSchema} from "../schema/staking.validator.schema";
import {StakingValidatorInfoTaskService} from "../task/staking.validator.info.task.service";
import {StakingValidatorMoreInfoTaskService} from "../task/staking.validator.more.info.task.service";
import {StakingHttp} from "../http/lcd/staking.http";
import {ParametersSchema} from "../schema/parameters.schema";
import {ParametersTaskService} from "../task/parameters.task.service";
import {TokensHttp} from "../http/lcd/tokens.http";
import {BlockHttp} from "../http/lcd/block.http";
import {GovHttp} from "../http/lcd/gov.http";

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
  providers:[StakingValidatorInfoTaskService,StakingValidatorMoreInfoTaskService,ParametersTaskService,StakingHttp,TokensHttp,BlockHttp,GovHttp],
  exports:[StakingValidatorInfoTaskService,StakingValidatorMoreInfoTaskService,ParametersTaskService],
})

export class StakingValidatorTaskModule{}
