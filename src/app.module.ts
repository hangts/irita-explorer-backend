import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DenomModule } from './module/denom.module';
import { NftModule } from './module/nft.module';
import { BlockModule } from './module/block.module';
import { StatisticsModule } from './module/statistics.module';
import { TxModule } from './module/tx.module';
import { TxTaskModule } from './module/tx.task.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './exception/HttpExceptionFilter';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './task/task.service';

import { cfg } from './config/config';
import { TaskDispatchModule } from './module/task.dispatch.module';
import { DenomTaskModule } from './module/denom.task.module';
import { NftTaskModule } from './module/nft.task.module';
import { ValidatorTaskModule } from './module/validator.task.module';
import { ValidatorModule } from './module/validator.module';

console.log(cfg);
const url: string = `mongodb://${cfg.dbCfg.user}:${cfg.dbCfg.psd}@${cfg.dbCfg.dbAddr}/${cfg.dbCfg.dbName}`;
const params = {
    imports: [
        MongooseModule.forRoot(url),
        ScheduleModule.forRoot(),
        DenomModule,
        NftModule,
        BlockModule,
        StatisticsModule,
        TaskDispatchModule,
        DenomTaskModule,
        NftTaskModule,
        ValidatorTaskModule,
        ValidatorModule,
        TxModule,
        TxTaskModule,
    ],
    providers: [],
};

if (cfg.env === 'development') {
    params.providers = [
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
    ];
} else {
    params.providers = [
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
        TasksService,
    ];
}


@Module(params)
export class AppModule {
}
