import {InjectMetric, makeGaugeProvider} from "@willsoto/nestjs-prometheus";
import {Gauge} from "prom-client";
import {Injectable} from "@nestjs/common";

@Injectable()
export class ExplorerBackendApiStatusMetric {
  constructor(@InjectMetric("explorer_backend_api_status") public gauge: Gauge<string>) {
  }

  async set(label: any, value: number) {
    this.gauge.set({"uri": label}, value)
  }
}

export function ExplorerApiStatusProvider() {
  return makeGaugeProvider({
    name: "explorer_backend_api_status",
    help: "explorer_backend_api_status (-1:abnormal 1:normal)",
    labelNames: ['uri'],
  })
}
