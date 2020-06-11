import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DenomModule } from './module/denom.module';
import { TxModule } from './module/tx.module';
import { TxTaskModule } from './module/tx.task.module';
import {APP_FILTER} from '@nestjs/core';
import {HttpExceptionFilter} from './exception/HttpExceptionFilter';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './task/task.service';

import {cfg} from './config';
console.log(cfg);

const url: string = `mongodb://${cfg.dbCfg.user}:${cfg.dbCfg.psd}@${cfg.dbCfg.dbAddr}/${cfg.dbCfg.dbName}`;
@Module({
    imports: [
    	MongooseModule.forRoot(url), 
        ScheduleModule.forRoot(),
    	DenomModule,
    	TxModule,
        TxTaskModule
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
        TasksService
    ],
})
export class AppModule {
}
