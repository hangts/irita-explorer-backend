import {InjectMetric, makeGaugeProvider} from "@willsoto/nestjs-prometheus";
import {Gauge} from "prom-client";
import {Injectable} from "@nestjs/common";

@Injectable()
export class CronTaskWorkingStatusMetric {
    constructor(@InjectMetric("explorer_backend_cron_task_working_status") public gauge: Gauge<string>) {}

    async collect(taskName,value) {
        this.gauge.set({
            "taskname":taskName,
        },value)
    }
}

export function CronTaskWorkingStatusProvider() {
    return makeGaugeProvider({
        name: "explorer_backend_cron_task_working_status",
        help: "explorer_backend_cron_task_working_status explorer-backend cron task working status (1:Working  0:Notwork -1:abnormal)",
        labelNames: ['taskname'],
    })
}
