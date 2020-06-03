import {Module } from '@nestjs/common';
import {BlockController} from '../controller/block.controller';
import {BlockService} from '../service/block.service';
import { MongooseModule } from '@nestjs/mongoose';
import {BlockSchema} from '../schema/block.schema';
import {HttpModule} from '@nestjs/common';
import {BlockHttp} from '../http/block.http';

@Module({
    imports:[
        MongooseModule.forFeature([{
            name: 'Block',
            schema: BlockSchema,
            collection: 'sync_block'
        }]),
        HttpModule
    ],
    providers:[BlockService, BlockHttp],
    controllers:[BlockController],
})
export class BlockModule{}