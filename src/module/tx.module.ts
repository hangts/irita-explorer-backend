import {Module } from '@nestjs/common';
import {TxController} from '../controller/tx.controller';
import {TxService} from '../service/tx.service';
import { MongooseModule } from '@nestjs/mongoose';
import {TxSchema} from '../schema/tx.schema';
import {TxTypeSchema} from '../schema/txType.schema';
import { NftMapSchema } from '../schema/nftMap.schema';

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
        },
        {
            name: 'NftMap',
            schema: NftMapSchema,
            collection: 'ex_sync_nft_mapping'
        }])
    ],
    providers:[TxService],
    controllers:[TxController],
})
export class TxModule{}