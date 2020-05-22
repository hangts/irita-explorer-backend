import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import config from '../config/config.json';
import {TxModule} from './tx/tx.module';

const url: string = `mongodb://${config.dbCfg.user}:${config.dbCfg.psd}@${config.dbCfg.host}:${config.dbCfg.port}/${config.dbCfg.database}`;
console.log()
@Module({
  imports: [MongooseModule.forRoot(url),TxModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
