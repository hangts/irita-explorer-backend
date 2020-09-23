import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {StakingValidatorSchema} from "../schema/staking.validator.schema";
import StakingValidatorService from "../service/staking.validator.service";
import {StakingValidatorHttp} from "../http/lcd/staking.validator.http";
import {ProfilerSchema} from "../schema/profiler.schema";
import {StakingValidatorController} from "../controller/stakingVallidator.controller";
import {ParametersSchema} from "../schema/parameters.schema";
import {TxSchema} from "../schema/tx.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: 'StakingSyncValidators',
                schema: StakingValidatorSchema,
                collection: 'ex_staking_validator'
            },
            {
                name: 'Profiler',
                schema: ProfilerSchema,
                collection: 'ex_profiler'
            },
            {
                name: 'Parameters',
                schema: ParametersSchema,
                collection: 'ex_sync_parameters'
            },
            {
                name: 'Tx',
                schema: TxSchema,
                collection: 'sync_tx'
            }
        ])
    ],
    providers: [StakingValidatorService, StakingValidatorHttp],
    controllers: [StakingValidatorController],
})
export class StakingValidatorModule {
}
