import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {ParametersSchema} from "../schema/parameters.schema";
import {ParametersTaskService} from "../task/parameters.task.service";
import {StakingValidatorHttp} from "../http/lcd/staking.validator.http";
import {StakingValidatorTaskService} from "../task/staking.validator.task.service";
import {StakingValidatorSchema} from "../schema/staking.validator.schema";
@Module({
    imports:[
        MongooseModule.forFeature([
            {
                name:'ParametersTask',
                schema: ParametersSchema,
                collection:'ex_sync_parameters'
            }
        ])
    ],
    providers:[ParametersTaskService,StakingValidatorHttp],
    exports:[ParametersTaskService,StakingValidatorHttp],
})
export class ParametersTaskModule {

}
