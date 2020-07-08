import {Module } from '@nestjs/common';
import {DenomTaskService} from '../task/denom.task.service';
import { MongooseModule } from '@nestjs/mongoose';
import {DenomSchema} from '../schema/denom.schema';
import { DenomHttp } from '../http/lcd/denom.http';

@Module({
    imports:[
        MongooseModule.forFeature([{
            name: 'Denom',
            schema: DenomSchema,
            collection: 'ex_sync_denom'
        }]),
    ],
    providers:[DenomTaskService, DenomHttp],
    exports:[DenomTaskService]
})
export class DenomTaskModule{}