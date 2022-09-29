import {Module } from '@nestjs/common';
import {GovController} from '../controller/gov.controller';
import {GovService} from '../service/gov.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TxSchema } from '../schema/tx.schema';
import { ProposalSchema } from '../schema/proposal.schema';
import { ProposalDetailSchema } from '../schema/proposal.detail.schema';
import {StakingValidatorSchema} from "../schema/staking.validator.schema";
import {ValidatorSchema} from "../schema/validators.schema";
@Module({
    imports:[
        MongooseModule.forFeature([
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
                name: 'ProposalDetail',
                schema: ProposalDetailSchema,
                collection: 'ex_sync_proposal_details'
            },
            {
                name: 'StakingValidator',
                schema: StakingValidatorSchema,
                collection: 'ex_staking_validator'
            },
            {
                name:'SyncValidators',
                schema:ValidatorSchema,
                collection:'ex_sync_validator'
            }
        ]),
    ],
    providers:[GovService],
    controllers:[GovController],
})
export class GovModule{}
