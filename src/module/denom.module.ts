import { Module } from '@nestjs/common';
import { DenomController } from '../controller/denom.controller';
import { DenomService } from '../service/denom.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DenomSchema } from '../schema/denom.schema';
import { NftMapSchema } from '../schema/nftMap.schema';
import { TxSchema } from '../schema/tx.schema';
import { NftSchema } from '../schema/nft.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{
            name: 'Denom',
            schema: DenomSchema,
            collection: 'ex_sync_denom',
        },
            {
                name: 'NftMap',
                schema: NftMapSchema,
                collection: 'ex_sync_nft_mapping',
            },
            {
                name: 'Nft',
                schema: NftSchema,
                collection: 'ex_sync_nft',
            },
            {
                name: 'Tx',
                schema: TxSchema,
                collection: 'sync_tx',
            }]),
    ],
    providers: [DenomService],
    controllers: [DenomController],
})
export class DenomModule {
}