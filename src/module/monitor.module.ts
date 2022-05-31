import { Module } from '@nestjs/common';
import { PrometheusModule} from "@willsoto/nestjs-prometheus";

@Module({
    imports: [
        PrometheusModule.register({
            path: "/metrics",
        })],
    providers: [],
    exports: [
    ]
})
export class MonitorModule {}

