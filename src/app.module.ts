import { CacheModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IritaModule } from './module/irita.module';
import { DenomModule } from './module/denom.module';
import { NftModule } from './module/nft.module';
import { BlockModule } from './module/block.module';
import { TxModule } from './module/tx.module';
import { TxTaskModule } from './module/tx.task.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { HttpExceptionFilter } from './exception/HttpExceptionFilter';
import ValidationPipe from './pipe/validation.pipe';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './task/task.service';

import { cfg } from './config/config';
import { TaskDispatchModule } from './module/task.dispatch.module';
import { DenomTaskModule } from './module/denom.task.module';
import { NftTaskModule } from './module/nft.task.module';
import { ValidatorTaskModule } from './module/validator.task.module';
import { ValidatorModule } from './module/validator.module';

import { IdentityTaskModule } from './module/identity.task.module';
import { IdentityModule } from './module/identity.module';
import { DistributionModule } from './module/distribution.module';
import { StakingValidatorTaskModule } from "./module/staking.validator.task.module";
import { ParametersTaskModule } from "./module/parameters.taskModule";
import { ProfilerModule } from "./module/profiler.module";
import { StakingModule } from "./module/staking.module";
import { TokensTaskModule } from "./module/tokens.task.module";
import { ParameterModule } from './module/parameter.module';
import { TokenModule } from './module/token.module';
import { MonitorModule } from './module/monitor.module';
import { MongoTaskModule } from "./module/mongo.task.module";
import {
    CronTaskWorkingStatusMetric,
    CronTaskWorkingStatusProvider,
} from './monitor/metrics/cron_task_working_status.metric';
import { HttpCacheInterceptor } from "./interceptor/http-cache.interceptor";
import {ApiStatusTaskModule} from "./module/api.status.task.module";

const url: string = `mongodb://${cfg.dbCfg.user}:${cfg.dbCfg.psd}@${cfg.dbCfg.dbAddr}/${cfg.dbCfg.dbName}`;
const params = {
    imports: [
        MongooseModule.forRoot(url),
        ScheduleModule.forRoot(),
        IritaModule,
        DenomModule,
        NftModule,
        BlockModule,
        TaskDispatchModule,
        DenomTaskModule,
        NftTaskModule,
        ValidatorTaskModule,
        ValidatorModule,
        TxModule,
        TxTaskModule,
        IdentityTaskModule,
        IdentityModule,
        DistributionModule,
        StakingValidatorTaskModule,
        ParametersTaskModule,
        ProfilerModule,
        StakingModule,
        TokensTaskModule,
        ParameterModule,
        MonitorModule,
        TokenModule,
        MongoTaskModule,
        ApiStatusTaskModule,
        CacheModule.register()
    ],
    providers:<any> [
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
        {
            provide: APP_PIPE,
            useClass: ValidationPipe,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: HttpCacheInterceptor,
        },
        CronTaskWorkingStatusMetric, CronTaskWorkingStatusProvider(),
    ]
};
params.providers.push(TasksService);

// if (cfg.env !== 'development') {
//     params.providers.push(TasksService);
// }

@Module(params)
export class AppModule {
}
