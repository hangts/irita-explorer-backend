import { IsString, IsInt, Length, Min, Max, IsOptional, Equals, MinLength, ArrayNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseReqDto, BaseResDto, PagingReqDto } from './base.dto';
import { ApiError } from '../api/ApiResult';
import { ErrorCodes } from '../api/ResultCodes';
import { IBindTx } from '../types/tx.interface';
import { IDenomStruct } from '../types/schemaTypes/denom.interface';

// lcd相关请求返回值数据模型

/************************   response dto   ***************************/
// /nft/nfts/denoms response dto
export class DenomDto {
    id: string;
    name: string;
    schema:string;
    creator:string;

    constructor(value) {
        this.id = value.id || '';
        this.name = value.name || '';
        this.schema = value.schema || '';
        this.creator = value.creator || '';
    }

    static bundleData(value: any = []): DenomDto[] {
        let data: DenomDto[] = [];
        data = value.map((v: any) => {
            return new DenomDto(v);
        });
        return data;
    }
}

// /nft/nfts/collections/{denom} response dto

export class Nft {
    id: string;
    name: string;
    uri: string;
    data: string;
    owner: string;

    constructor(value) {
        this.id = value.id || '';
        this.name = value.name || '';
        this.uri = value.uri || '';
        this.data = value.data || '';
        this.owner = value.owner || '';
    }
}

export class NftCollectionDto {
    denom: DenomDto;
    nfts: Nft[];

    constructor(value) {
        let {denom, nfts} = value;
        this.denom = new DenomDto(denom);
        this.nfts = (nfts || []).map(item=>{
            return new Nft(item);
        });
    }
}

// /validator/validators response dto
export class VValidatorDto {
    id: string;
    name: string;
    pubkey: string;
    certificate: string;
    power: string;
    operator: string;
    jailed:boolean;
    details:string;

    constructor(value) {
        this.id = value.id || '';
        this.name = value.name || '';
        this.pubkey = value.pubkey || '';
        this.certificate = value.certificate || '';
        this.power = value.power || '';
        this.operator = value.operator || '';
        this.jailed = value.jailed || undefined;
        this.details = value.details || '';
    }

    static bundleData(value: any = []): VValidatorDto[] {
        let data: VValidatorDto[] = [];
        data = value.map((v: any) => {
            return new VValidatorDto(v);
        });
        return data;
    }
}


// /blocks/{height} or /blocks/latest response dto
export class BlockId {
    hash: string;
    parts: { total:number, hash:string};
    constructor(value) {
        let { hash, parts } = value;
        this.hash = hash || '';
        this.parts = parts;
    }
}

export class Signatures {
    block_id_flag: string;
    validator_address: string;
    timestamp: string;
    signature: string;

    constructor(value) {
        let { block_id_flag, validator_address, timestamp, signature } = value;
        this.block_id_flag = block_id_flag || '';
        this.validator_address = validator_address || '';
        this.timestamp = timestamp || '';
        this.signature = signature || '';
    }
}

export class BlockHeader {
    version: { block: string };
    chain_id: string;
    height: number;
    time: string;
    last_block_id: BlockId;
    last_commit_hash: string;
    data_hash: string;
    validators_hash: string;
    next_validators_hash: string;
    consensus_hash: string;
    last_results_hash: string;
    evidence_hash: string;
    proposer_address: string;

    constructor(value) {
        this.version = value.version;
        this.chain_id = value.chain_id || '';
        this.height = Number(value.height);
        this.time = value.time || '';
        this.last_block_id = new BlockId(value.last_block_id);
        this.last_commit_hash = value.last_commit_hash || '';
        this.data_hash = value.data_hash || '';
        this.validators_hash = value.validators_hash || '';
        this.next_validators_hash = value.next_validators_hash || '';
        this.consensus_hash = value.consensus_hash || '';
        this.last_results_hash = value.last_results_hash || '';
        this.evidence_hash = value.evidence_hash || '';
        this.proposer_address = value.proposer_address || '';
    }
}

export class Commit {
    height: number;
    round: number;
    block_id: BlockId;
    signatures: Signatures;
    constructor(value) {
        let { height, round, block_id, signatures } = value;
        this.height = Number(height);
        this.round = round;
        this.block_id = new BlockId(block_id);
        this.signatures = new Signatures(signatures);
    }
}

export class Block {
    header: BlockHeader;
    data: { txs:  any[]};
    evidence: { evidence:  any[]};
    last_commit: Commit;

    constructor(value) {
        let { BlockHeader, data, evidence, last_commit } = value;
        this.header = new BlockHeader(BlockHeader);
        this.data =  data;
        this.evidence =  evidence;
        this.last_commit = new Commit(last_commit);
    }
}

export class BlockDto {
    block_id: BlockId;
    block: Block;
    constructor(value) {
        let { block_id,  block } = value;
        this.block_id = new BlockId(block_id);
        this.block = new Block(block);
    }
}