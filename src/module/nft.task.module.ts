import {Module } from '@nestjs/common';
import {NftTaskService} from '../task/nft.task.service';
import { MongooseModule } from '@nestjs/mongoose';
import {NftSchema} from '../schema/nft.schema';
import { NftHttp } from '../http/lcd/nft.http';
import { DenomSchema } from '../schema/denom.schema';

@Module({
    imports:[
        MongooseModule.forFeature([{
            name: 'Nft',
            schema: NftSchema,
            collection: 'sync_nft'
        }]),
        MongooseModule.forFeature([{
            name: 'Denom',
            schema: DenomSchema,
            collection: 'sync_denom'
        }]),
    ],
    providers:[NftTaskService, NftHttp],
    exports:[NftTaskService]
})
export class NftTaskModule{}