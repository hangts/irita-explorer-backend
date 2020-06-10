import {Module } from '@nestjs/common';
import {StatisticsController} from '../controller/statistics.controller';
import {StatisticsService} from '../service/statistics.service';
import { MongooseModule } from '@nestjs/mongoose';
import {BlockSchema} from '../schema/block.schema';
import { NftSchema } from '../schema/nft.schema';
import { TxSchema } from '../schema/tx.schema';

@Module({
    imports:[
        MongooseModule.forFeature([{
            name: 'Block',
            schema: BlockSchema,
            collection: 'sync_block'
        },{
            name: 'Tx',
            schema: TxSchema,
            collection: 'sync_tx'
        },{
            name: 'Nft',
            schema: NftSchema,
            collection: 'sync_nft'
        }]),
    ],
    providers:[StatisticsService],
    controllers:[StatisticsController],
})
export class StatisticsModule{}