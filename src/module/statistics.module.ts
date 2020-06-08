import {Module } from '@nestjs/common';
import {StatisticsController} from '../controller/statistics.controller';
import {StatisticsService} from '../service/statistics.service';
import { MongooseModule } from '@nestjs/mongoose';
import {BlockSchema} from '../schema/block.schema';
import { NftSchema } from '../schema/nft.schema';

@Module({
    imports:[
        MongooseModule.forFeature([{
            name: 'Block',
            schema: BlockSchema,
            collection: 'sync_block'
        }]),
        MongooseModule.forFeature([{
            name: 'Nft',
            schema: NftSchema,
            collection: 'sync_nfts'
        }]),
    ],
    providers:[StatisticsService],
    controllers:[StatisticsController],
})
export class StatisticsModule{}