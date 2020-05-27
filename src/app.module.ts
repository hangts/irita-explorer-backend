import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TxModule } from './middleware/tx.module';
import {APP_FILTER} from '@nestjs/core';
import {HttpExceptionFilter} from './exception/HttpExceptionFilter';

const { MONGODB_USER, MONGODB_PSD, MONGODB_HOST, MONGODB_PORT, MONGODB_DATABASE, NODE_ENV } = process.env;
const url: string = `mongodb://${MONGODB_USER}:${MONGODB_PSD}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}`;

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
