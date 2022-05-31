import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {ParametersSchema} from "../schema/parameters.schema";
import {ParametersTaskService} from "../task/parameters.task.service";
import {StakingHttp} from "../http/lcd/staking.http";
import {TokensHttp} from "../http/lcd/tokens.http";
import {GovHttp} from "../http/lcd/gov.http";
import {
    CronTaskWorkingStatusMetric,
    CronTaskWorkingStatusProvider
} from "../monitor/metrics/cron_task_working_status.metric";
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
    providers:[ParametersTaskService,StakingHttp,TokensHttp,GovHttp,
        CronTaskWorkingStatusMetric, CronTaskWorkingStatusProvider()],
    exports:[ParametersTaskService,StakingHttp],
})
export class ParametersTaskModule {

}
