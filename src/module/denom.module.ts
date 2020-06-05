import {Module } from '@nestjs/common';
import {DenomController} from '../controller/denom.controller';
import {DenomService} from '../service/denom.service';
import { MongooseModule } from '@nestjs/mongoose';
import {DenomSchema} from '../schema/denom.schema';
import { DenomHttp } from '../http/denom.http';

@Module({
    imports:[
        MongooseModule.forFeature([{
            name: 'Denom',
            schema: DenomSchema,
            collection: 'sync_denom'
        }]),
    ],
    providers:[DenomService, DenomHttp],
    controllers:[DenomController],
    exports:[DenomService]
})
export class DenomModule{}