import { Module } from '@nestjs/common';
import { MongoConnectStatusTaskService } from "../task/mongo.connect.status.task.service";
import { MongoConnectStatusMetric, MongoConnectStatusProvider } from "../monitor/metrics/mongo_connect_status.metric";

@Module({
  imports: [],
  providers: [MongoConnectStatusTaskService, MongoConnectStatusMetric, MongoConnectStatusProvider()],
  exports: [MongoConnectStatusTaskService]
})
export class MongoTaskModule {
}