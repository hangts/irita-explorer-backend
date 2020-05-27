import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TxModule } from './module/tx.module';
import {APP_FILTER} from '@nestjs/core';
import {HttpExceptionFilter} from './exception/HttpExceptionFilter';
import {cfg} from './config';
console.log(cfg);
const url: string = `mongodb://${cfg.dbCfg.user}:${cfg.dbCfg.psd}@${cfg.dbCfg.host}:${cfg.dbCfg.port}/${cfg.dbCfg.db}`;
@Module({
    imports: [MongooseModule.forRoot(url), TxModule],
    providers: [
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
    ],
})
export class AppModule {
}
