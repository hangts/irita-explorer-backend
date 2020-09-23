import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {ParametersSchema} from "../schema/parameters.schema";
import {ParametersTaskService} from "../task/parameters.task.service";
import {StakingHttp} from "../http/lcd/staking.http";
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
    providers:[ParametersTaskService,StakingHttp],
    exports:[ParametersTaskService,StakingHttp],
})
export class ParametersTaskModule {

}
