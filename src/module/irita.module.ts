/* 一个通用的module 一些不方便归类模块的api可以放在这里 */

import {Module} from '@nestjs/common';
import {IritaController} from '../controller/irita.controller';
import {IritaService} from '../service/irita.service';
import {MongooseModule} from '@nestjs/mongoose';
import {NetworkSchema} from '../schema/network.schema';
import {TokenScaleSchema} from "../schema/token.scale.schema";
import {TokenScaleTaskService} from "../task/token.scale.task.service";
import {TokenScaleHttp} from "../http/lcd/token.scale.http";
import {ParametersSchema} from "../schema/parameters.schema";
import {ParametersTaskService} from "../task/parameters.task.service";
import {StakingHttp} from "../http/lcd/staking.http";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: 'Network',
                schema: NetworkSchema,
                collection: 'ex_network'
            },
            {
                name: 'TokenScale',
                schema: TokenScaleSchema,
                collection: 'ex_token_scale'
            },
            {
                name:'ParametersTask',
                schema: ParametersSchema,
                collection:'ex_sync_parameters'
            }
        ])
    ],
    providers: [IritaService, TokenScaleTaskService, TokenScaleHttp,ParametersTaskService,StakingHttp],
    controllers: [IritaController],
})
export class IritaModule {
}
