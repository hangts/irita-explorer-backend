import {Module } from '@nestjs/common';
import {NftController} from '../controller/nft.controller';
import {NftService} from '../service/nft.service';
import { MongooseModule } from '@nestjs/mongoose';
import {NftSchema} from '../schema/nft.schema';
import { DenomSchema } from '../schema/denom.schema';

@Module({
    imports:[
        MongooseModule.forFeature([{
            name: 'Nft',
            schema: NftSchema,
            collection: 'sync_nft'
        },{
            name: 'Denom',
            schema: DenomSchema,
            collection: 'sync_denom'
        }])
    ],
    providers:[NftService],
    controllers:[NftController],
    exports:[NftService]
})
export class NftModule{}