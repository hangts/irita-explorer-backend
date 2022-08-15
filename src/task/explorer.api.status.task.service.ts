import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {ExplorerBackendApiStatusMetric} from "../monitor/metrics/explorer_api_status.metric";

@Injectable()
export class ExplorerApiStatusTaskService {

  constructor(@InjectModel('Block') private blockModel: any,
              private readonly explorerBackendApiStatusMetric: ExplorerBackendApiStatusMetric) {
    this.doTask = this.doTask.bind(this);
  }

  async doTask(): Promise<void> {
    const uri = "/block"
    try {
      await this.blockModel.blockApiStatusQuery();
      const normal = 1;
      await this.explorerBackendApiStatusMetric.set(uri, normal);
    } catch (e) {
      const abnormal = -1;
      await this.explorerBackendApiStatusMetric.set(uri, abnormal);
    }
  }
}
