import {Module } from '@nestjs/common';
import {TxTaskService} from '../task/tx.task.service';
import { MongooseModule } from '@nestjs/mongoose';
import {TxSchema} from '../schema/tx.schema';

@Module({
    imports:[
        MongooseModule.forFeature([{
            name: 'Tx',
            schema: TxSchema,
            collection: 'sync_tx'
        }])
    ],
    providers:[TxTaskService],
    exports:[TxTaskService]
})
export class TxTaskModule{}