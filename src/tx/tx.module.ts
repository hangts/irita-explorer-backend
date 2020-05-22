import {Module } from '@nestjs/common';
import {TxController} from './tx.controller';
import {TxService} from './tx.service';
import { MongooseModule } from '@nestjs/mongoose';
import {TxSchema} from './tx.schema';

@Module({
    imports:[
        MongooseModule.forFeature([{
            name: 'Tx',
            schema: TxSchema,
            collection: 'tx_common'
        }])
    ],
    providers:[TxService],
    controllers:[TxController],
})
export class TxModule{}