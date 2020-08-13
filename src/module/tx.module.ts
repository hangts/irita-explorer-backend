import { Module } from '@nestjs/common';
import { TxController } from '../controller/tx.controller';
import { TxService } from '../service/tx.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TxSchema } from '../schema/tx.schema';
import { TxTypeSchema } from '../schema/txType.schema';
import { DenomSchema } from '../schema/denom.schema';
import { NftSchema } from '../schema/nft.schema';

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
            name: 'Denom',
            schema: DenomSchema,
            collection: 'ex_sync_denom'
        },
        {
            name: 'Nft',
            schema: NftSchema,
            collection: 'ex_sync_nft'
        }])
    ],
    providers:[TxService],
    controllers:[TxController],
})
export class TxModule{}