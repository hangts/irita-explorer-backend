import { Module } from '@nestjs/common';
import { DenomController } from '../controller/denom.controller';
import { DenomService } from '../service/denom.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DenomSchema } from '../schema/denom.schema';
import { NftSchema } from '../schema/nft.schema';
import {StatisticsSchema} from "../schema/statistics.schema";

@Module({
    imports: [
        MongooseModule.forFeature([{
            name: 'Denom',
            schema: DenomSchema,
            collection: 'ex_sync_denom',
        }, {
            name: 'Nft',
            schema: NftSchema,
            collection: 'ex_sync_nft',
        },{
            name: 'Statistics',
            schema: StatisticsSchema,
            collection: 'ex_statistics'
        },]),

    ],
    providers: [DenomService],
    controllers: [DenomController],
})
export class DenomModule {
}