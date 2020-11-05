import {Module } from '@nestjs/common';
import {AssetController} from '../controller/asset.controller';
import {AssetService} from '../service/asset.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TxSchema } from '../schema/tx.schema';
import {TokensSchema} from "../schema/tokens.schema";
@Module({
    imports:[
        MongooseModule.forFeature([
            {
                name:'Tokens',
                schema: TokensSchema,
                collection:'ex_tokens'
            },
            {
                name: 'Tx',
                schema: TxSchema,
                collection: 'sync_tx'
            }]),
    ],
    providers:[AssetService],
    controllers:[AssetController],
})
export class AssetModule{}
