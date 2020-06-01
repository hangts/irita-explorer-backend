import {Module } from '@nestjs/common';
import {DenomController} from '../controller/denom.controller';
import {DenomService} from '../service/denom.service';
import { MongooseModule } from '@nestjs/mongoose';
import {DenomSchema} from '../schema/denom.schema';

@Module({
    imports:[
        MongooseModule.forFeature([{
            name: 'Denom',
            schema: DenomSchema,
            collection: 'sync_denom'
        }])
    ],
    providers:[DenomService],
    controllers:[DenomController],
})
export class DenomModule{}