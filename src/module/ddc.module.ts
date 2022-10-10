import {Module } from '@nestjs/common';
import {DdcController} from '../controller/ddc.controller';
import {DdcService} from '../service/ddc.service';
import { MongooseModule } from '@nestjs/mongoose';
import {DdcSchema} from '../schema/ddc.schema';
import {StatisticsSchema} from "../schema/statistics.schema";

@Module({
  imports:[
    MongooseModule.forFeature([{
      name: 'Ddc',
      schema: DdcSchema,
      collection: 'ex_sync_ddc'
    },{
      name: 'Statistics',
      schema: StatisticsSchema,
      collection: 'ex_statistics'
    }])
  ],
  providers:[DdcService],
  controllers:[DdcController],
  exports:[DdcService]
})
export class DdcModule{}