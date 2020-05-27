import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {TxModule} from './middleware/tx.module';
const {MONGODB_USER, MONGODB_PSD, MONGODB_HOST, MONGODB_PORT, MONGODB_DATABASE, NODE_ENV} = process.env;
const url: string = `mongodb://${MONGODB_USER}:${MONGODB_PSD}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}`;
console.log(NODE_ENV)
@Module({
  imports: [MongooseModule.forRoot(url),TxModule],
})
export class AppModule {}
