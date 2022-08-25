import {Module} from '@nestjs/common';
import {ExplorerApiStatusTaskService} from "../task/explorer.api.status.task.service";
import {MongooseModule} from "@nestjs/mongoose";
import {BlockSchema} from "../schema/block.schema";
import {ExplorerApiStatusProvider, ExplorerBackendApiStatusMetric} from "../monitor/metrics/explorer_api_status.metric";
import {TxSchema} from "../schema/tx.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Block',
        schema: BlockSchema,
        collection: 'sync_block'
      },
      {
        name: 'Tx',
        schema: TxSchema,
        collection: 'sync_tx'
      }
    ])],
  providers: [ExplorerApiStatusTaskService, ExplorerBackendApiStatusMetric, ExplorerApiStatusProvider()],
  exports: [ExplorerApiStatusTaskService]
})

export class ApiStatusTaskModule {
}