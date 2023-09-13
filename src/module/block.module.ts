import {Module } from '@nestjs/common';
import {BlockController} from '../controller/block.controller';
import {BlockService} from '../service/block.service';
import { MongooseModule } from '@nestjs/mongoose';
import {BlockSchema} from '../schema/block.schema';
import { StakingValidatorSchema } from '../schema/staking.validator.schema';
import {HttpModule} from '@nestjs/common';
import {ValidatorSchema} from "../schema/validators.schema";

@Module({
    imports:[
        MongooseModule.forFeature([{
            name: 'Block',
            schema: BlockSchema,
            collection: 'sync_block'
        },{
            name:'StakingValidator',
            schema:StakingValidatorSchema,
            collection:'ex_staking_validator'
        },{
            name: 'SyncValidators',
            schema:ValidatorSchema,
            collection:'ex_sync_validator'
        }]),
        HttpModule,

    ],
    providers:[BlockService],
    controllers:[BlockController],
})
export class BlockModule{}
