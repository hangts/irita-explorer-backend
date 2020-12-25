import {Module } from '@nestjs/common';
import {GovController} from '../controller/gov.controller';
import {GovService} from '../service/gov.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TxSchema } from '../schema/tx.schema';
import { ProposalSchema } from '../schema/proposal.schema';
import { ProposalDetailSchema } from '../schema/proposal.detail.schema';
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
                collection: 'ex_sync_ proposal'
            },
            {
                name: 'ProposalDetail',
                schema: ProposalDetailSchema,
                collection: 'ex_sync_ proposal_details'
            }
        ]),
    ],
    providers:[GovService],
    controllers:[GovController],
})
export class GovModule{}
