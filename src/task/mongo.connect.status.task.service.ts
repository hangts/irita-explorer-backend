import { Injectable } from '@nestjs/common';
import { MongoConnectStatusMetric } from "../monitor/metrics/mongo_connect_status.metric";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from 'mongoose';

@Injectable()
export class MongoConnectStatusTaskService {

  constructor(@InjectConnection() private connection: Connection, private readonly mongoConnectStatusMetric: MongoConnectStatusMetric) {
    this.doTask = this.doTask.bind(this);
  }

  async doTask(): Promise<void> {
    const connected = 1;
    const disconnected = 0; // connecting/disconnecting also use 0
    const connectStatus = this.connection.readyState == connected ? connected : disconnected;
    await this.mongoConnectStatusMetric.set(connectStatus);
  }
}
