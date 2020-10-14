import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {TokenScaleSchema} from "../schema/token.scale.schema";
import {TokenScaleTaskService} from "../task/token.scale.task.service";
import {TokenScaleHttp} from "../http/lcd/token.scale.http";
import {ParametersSchema} from "../schema/parameters.schema";
import {ParametersTaskService} from "../task/parameters.task.service";
import {StakingHttp} from "../http/lcd/staking.http";
@Module({
    imports:[
        MongooseModule.forFeature([
            {
                name:'TokenScale',
                schema: TokenScaleSchema,
                collection:'ex_token_scale'
            },
            {
                name:'ParametersTask',
                schema: ParametersSchema,
                collection:'ex_sync_parameters'
            }
        ])
    ],
    providers:[TokenScaleTaskService,StakingHttp,TokenScaleHttp,ParametersTaskService],
    exports: [TokenScaleTaskService,]
})
export class TokenScaleModule{}
