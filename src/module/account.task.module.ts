import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TxSchema } from '../schema/tx.schema';
import { AccountTaskService } from "../task/account.task.service";
import { AccountInfoTaskService } from "../task/account.info.task.service";
import { SyncTaskSchema } from '../schema/sync.task.schema';
import { AccountSchema } from '../schema/account.schema';
import { StakingHttp } from "../http/lcd/staking.http";
import { ParametersSchema } from "../schema/parameters.schema";
import { DistributionHttp } from "../http/lcd/distribution.http";
import {StakingValidatorSchema} from "../schema/staking.validator.schema";
@Module({
    imports:[
        MongooseModule.forFeature([
            {
                name: 'Tx',
                schema: TxSchema,
                collection: 'sync_tx'
            },{
                name: 'SyncTask',
                schema: SyncTaskSchema,
                collection: 'sync_task'
            },{
                name: 'Account',
                schema: AccountSchema,
                collection: 'ex_account'
            },{
                name:'ParametersTask',
                schema: ParametersSchema,
                collection:'ex_sync_parameters'
            },{
                name:'StakingSyncValidators',
                schema: StakingValidatorSchema,
                collection:'ex_staking_validator'
            }
        ])
    ],
    providers:[AccountTaskService,AccountInfoTaskService,StakingHttp,DistributionHttp],
    exports: [AccountTaskService,AccountInfoTaskService]
})
export class AccountTaskModule{}
