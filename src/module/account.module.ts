import {Module } from '@nestjs/common';
import {AccountController} from '../controller/account.controller';
import {AccountService} from '../service/account.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountSchema } from '../schema/account.schema';
import { ParametersSchema } from "../schema/parameters.schema";
import { TokensHttp } from "../http/lcd/tokens.http";
import { StakingHttp } from "../http/lcd/staking.http";
import {TokensSchema} from "../schema/tokens.schema";
@Module({
    imports:[
        MongooseModule.forFeature([
            {
                name: 'Account',
                schema: AccountSchema,
                collection: 'ex_account'
            },{
                name:'ParametersTask',
                schema: ParametersSchema,
                collection:'ex_sync_parameters'
            },{
                name:'Tokens',
                schema: TokensSchema,
                collection:'ex_tokens'
            }
        ]),
    ],
    providers:[AccountService,TokensHttp,StakingHttp],
    controllers:[AccountController],
})
export class AccountModule{}
