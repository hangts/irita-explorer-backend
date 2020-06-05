import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DenomModule } from './module/denom.module';
import {NftModule} from './module/nft.module';
import { BlockModule } from './module/block.module';
import {APP_FILTER} from '@nestjs/core';
import {HttpExceptionFilter} from './exception/HttpExceptionFilter';
import {cfg} from './config';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './task/task.service';

console.log(cfg);
const url: string = `mongodb://${cfg.dbCfg.user}:${cfg.dbCfg.psd}@${cfg.dbCfg.host}:${cfg.dbCfg.port}/${cfg.dbCfg.db}`;
@Module({
    imports: [
        MongooseModule.forRoot(url),
        ScheduleModule.forRoot(),
        DenomModule,
        NftModule,
        BlockModule,
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
        TasksService,
    ],
})
export class AppModule {
}
