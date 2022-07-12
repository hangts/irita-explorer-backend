import { InjectMetric, makeGaugeProvider } from "@willsoto/nestjs-prometheus";
import { Gauge} from "prom-client";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MongoConnectStatusMetric {
  constructor(@InjectMetric("mongo_connect_status") public gauge: Gauge<string>) {
  }

  async set(value) {
    this.gauge.set(value)
  }
}

export function MongoConnectStatusProvider() {
  return makeGaugeProvider({
    name: "mongo_connect_status",
    help: "mongo_connect_status (0:disconnected 1:connected)",
  })
}
