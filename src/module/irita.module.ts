/* 一个通用的module 一些不方便归类模块的api可以放在这里 */

import { Module } from '@nestjs/common';
import { IritaController } from '../controller/irita.controller';
import { IritaService } from '../service/irita.service';
import { MongooseModule } from '@nestjs/mongoose';
import { NetworkSchema } from '../schema/network.schema';

import { IdentitySchema } from '../schema/identity.schema';

@Module({
    imports:[
        MongooseModule.forFeature([{
            name: 'Network',
            schema: NetworkSchema,
            collection: 'ex_network'
        }])
    ],
    providers:[IritaService],
    controllers:[IritaController],
})
export class IritaModule{}
