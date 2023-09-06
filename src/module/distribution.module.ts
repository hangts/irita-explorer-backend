import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StakingValidatorSchema } from '../schema/staking.validator.schema';
import { DistributionService } from "../service/distribution.service";
import { DistributionController }  from "../controller/distribution.controller"
import {TxModule} from "./tx.module";

@Module({
    imports:[
        MongooseModule.forFeature([
            {
                name:'StakingValidator',
                schema:StakingValidatorSchema,
                collection:'ex_staking_validator'
            }
        ]),
        TxModule
    ],
    providers: [  DistributionService ],
    controllers: [ DistributionController ]
})

export class DistributionModule { }


