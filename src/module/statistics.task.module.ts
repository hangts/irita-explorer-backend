import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NftSchema } from '../schema/nft.schema';
import { DenomSchema } from '../schema/denom.schema';
import { TxSchema } from '../schema/tx.schema';
import { StatisticsTaskService } from '../task/statistics.task.service';
import { BlockSchema } from '../schema/block.schema';
import { ValidatorSchema } from '../schema/validators.schema';
import { IdentitySchema } from '../schema/identity.schema';
import { StakingValidatorSchema } from "../schema/staking.validator.schema";
import {TokensSchema} from "../schema/tokens.schema";
import { StatisticsSchema } from '../schema/statistics.schema';

@Module({
  imports:[
    MongooseModule.forFeature([{
      name: 'Block',
      schema: BlockSchema,
      collection: 'sync_block'
    }, {
      name: 'Tx',
      schema: TxSchema,
      collection: 'sync_tx'
    }, {
      name: 'Nft',
      schema: NftSchema,
      collection: 'ex_sync_nft'
    }, {
      name: 'Validators',
      schema: ValidatorSchema,
      collection: 'ex_sync_validator'
    }, {
      name: 'Identity',
      schema: IdentitySchema,
      collection: 'ex_sync_identity'
    }, {
      name: 'Denom',
      schema: DenomSchema,
      collection: 'ex_sync_denom',
    },
      {
        name: 'StakingSyncValidators',
        schema: StakingValidatorSchema,
        collection: 'ex_staking_validator'
      },{
        name:'Tokens',
        schema: TokensSchema,
        collection:'ex_tokens'
      },{
        name: 'Statistics',
        schema: StatisticsSchema,
        collection: 'ex_statistics'
      }]),
  ],
  providers:[StatisticsTaskService],
  exports:[StatisticsTaskService]
})
export class StatisticsTaskModule{}