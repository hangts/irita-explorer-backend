import { Module } from '@nestjs/common';
import { TxController } from '../controller/tx.controller';
import { TxService } from '../service/tx.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TxSchema } from '../schema/tx.schema';
import { TxTypeSchema } from '../schema/txType.schema';
import { DenomSchema } from '../schema/denom.schema';
import { NftSchema } from '../schema/nft.schema';
import { TxEvmSchema } from '../schema/txEvmSchema';
import { EvmContractConfigSchema } from '../schema/evmContractConfig.schema';
import { IdentitySchema } from '../schema/identity.schema';
import {StakingValidatorSchema} from "../schema/staking.validator.schema";
import { ProposalSchema } from '../schema/proposal.schema';
import { GovHttp } from "../http/lcd/gov.http";
import { StatisticsSchema } from '../schema/statistics.schema';
import {MtDenomSchema} from "../schema/mtDenom.schema";
import {BlockSchema} from "../schema/block.schema";
import {ContractErc20Schema} from "../schema/ContractErc20.schema";
import {ContractErc721Schema} from "../schema/ContractErc721.schema";
import {ContractErc1155Schema} from "../schema/ContractErc1155.schema";
import {ContractOtherSchema} from "../schema/ContractOther.schema";
import {TokensHttp} from "../http/lcd/tokens.http";
import {TokensSchema} from "../schema/tokens.schema";
import {Layer2Http} from "../http/lcd/layer2.http";
@Module({
    imports:[
        MongooseModule.forFeature([{
            name: 'Tx',
            schema: TxSchema,
            collection: 'sync_tx'
        },
        {
            name: 'TxType',
            schema: TxTypeSchema,
            collection: 'ex_tx_type'
        },
        {
            name: 'Denom',
            schema: DenomSchema,
            collection: 'ex_sync_denom'
        },
        {
            name: 'MtDenom',
            schema: MtDenomSchema,
            collection: 'ex_mt_denom'
        },
        {
            name: 'Identity',
            schema: IdentitySchema,
            collection: 'sync_identity'
        },
        {
            name: 'Nft',
            schema: NftSchema,
            collection: 'ex_sync_nft'
        },
        {
            name: 'TxEvm',
            schema: TxEvmSchema,
            collection: 'ex_evm_tx'
        },{
            name: 'EvmContractConfig',
            schema: EvmContractConfigSchema,
            collection: 'ex_evm_contracts_config'
        },
        {
            name: 'StakingValidator',
            schema: StakingValidatorSchema,
            collection: 'ex_staking_validator'
        },
        {
            name: 'Proposal',
            schema: ProposalSchema,
            collection: 'ex_proposal'
        },{
            name: 'Statistics',
            schema: StatisticsSchema,
            collection: 'ex_statistics'
        },{
            name: 'Block',
            schema: BlockSchema,
            collection: 'sync_block'
        },{
            name: 'ContractErc20',
            schema: ContractErc20Schema,
            collection: 'ex_contract_erc20'
        },{
            name: 'ContractErc721',
            schema: ContractErc721Schema,
            collection: 'ex_contract_erc721'
        },{
            name: 'ContractErc1155',
            schema: ContractErc1155Schema,
            collection: 'ex_contract_erc1155'
        },{
            name: 'ContractOther',
            schema: ContractOtherSchema,
            collection: 'ex_contract_other'
        },{
            name: 'Tokens',
            schema: TokensSchema,
            collection: 'ex_tokens'
        }])
    ],
    providers:[TxService,GovHttp,TokensHttp,Layer2Http],
    controllers:[TxController],
})
export class TxModule{}
