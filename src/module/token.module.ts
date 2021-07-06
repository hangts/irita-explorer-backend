import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokensSchema } from "../schema/tokens.schema";
import { TokenService } from "../service/token.service";
import {TokensHttp} from "../http/lcd/tokens.http";
@Module({
    imports:[
        MongooseModule.forFeature([
            {
                name:'Tokens',
                schema: TokensSchema,
                collection:'ex_tokens'
            }
        ])
    ],
    providers:[TokenService, TokensHttp],
    exports: [TokenService]
})
export class TokenModule{}
