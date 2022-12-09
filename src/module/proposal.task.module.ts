import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {ParametersSchema} from "../schema/parameters.schema";
import { TxSchema } from '../schema/tx.schema';
import { ProposalSchema } from '../schema/proposal.schema';
import { ProposalDetailSchema } from '../schema/proposal.detail.schema';
import { ProposalTaskService } from "../task/proposal.task.service";
import { GovHttp } from "../http/lcd/gov.http";
import { Govv1Http } from "../http/lcd/govv1.http";
import { StakingValidatorSchema } from "../schema/staking.validator.schema";
import {StakingHttp} from "../http/lcd/staking.http";
import {
    CronTaskWorkingStatusMetric,
    CronTaskWorkingStatusProvider
} from "../monitor/metrics/cron_task_working_status.metric";
import {ValidatorSchema} from "../schema/validators.schema";
@Module({
    imports:[
        MongooseModule.forFeature([
            {
                name:'ParametersTask',
                schema: ParametersSchema,
                collection:'ex_sync_parameters'
            },
            {
                name: 'Tx',
                schema: TxSchema,
                collection: 'sync_tx'
            },
            {
                name: 'Proposal',
                schema: ProposalSchema,
                collection: 'ex_sync_proposal'
            },
            {
                name: 'StakingSyncValidators',
                schema: StakingValidatorSchema,
                collection: 'ex_staking_validator'
            },
            {
                name: 'ProposalDetail',
                schema: ProposalDetailSchema,
                collection: 'ex_sync_proposal_details'
            },
            {
                name:'SyncValidators',
                schema:ValidatorSchema,
                collection:'ex_sync_validator'
            },
        ])
    ],
    providers:[ProposalTaskService,GovHttp,Govv1Http,StakingHttp,CronTaskWorkingStatusMetric, CronTaskWorkingStatusProvider()],
    exports: [ProposalTaskService]
})
export class ProposalTaskModule{}
