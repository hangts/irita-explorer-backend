import {Module } from '@nestjs/common';
import {TxController} from '../controller/tx.controller';
import {TxService} from '../service/tx.service';
import { MongooseModule } from '@nestjs/mongoose';
import {TxSchema} from '../schema/tx.schema';
import {TxTypeSchema} from '../schema/txType.schema';

@Module({
    imports:[
        MongooseModule.forFeature([{
            name: 'Tx',
            schema: TxSchema,
            collection: 'sync_tx'
        },
        {
            name: 'TxType',
            schema: TxTypeSchema,
            collection: 'ex_tx_type'
        }])
    ],
    providers:[TxService],
    controllers:[TxController],
})
export class TxModule{}