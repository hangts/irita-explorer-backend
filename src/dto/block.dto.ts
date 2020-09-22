import { BaseReqDto, PagingReqDto } from './base.dto';
import { ApiError } from '../api/ApiResult';
import { ErrorCodes } from '../api/ResultCodes';
import { ApiProperty } from '@nestjs/swagger';
import { Coin } from './common.res.dto';

export class BlockResDto {
    height?: number;
    hash?: string;
    txn?: number;
    time?: string;

    constructor(height: number, hash: string, txn: number, time: string) {
        this.height = height;
        this.hash = hash;
        this.txn = txn;
        this.time = time;
    }
}

export class BlockListResDto extends BlockResDto {
    constructor(height: number, hash: string, txn: number, time: string) {
        super(height, hash, txn, time);
    }
}

// blocks/staking/:height
export class BlockStakingResDto {
    height: string;
    time: number;
    hash: string;
    txn: string;
    propopser_moniker: string;
    propopser_addr: string;
    precommit_validator_num: number;
    total_validator_num: number;
    precommit_voting_power: number;
    total_voting_power: number;
    latest_height: string;
    // mint_coin: Coin;

    constructor(value) {
        this.height = value.height;
        this.time = value.time;
        this.hash = value.hash;
        this.txn = value.txn;
        this.propopser_moniker = value.propopser_moniker;
        this.propopser_addr = value.propopser_addr;
        this.precommit_validator_num = value.precommit_validator_num;
        this.total_validator_num = value.total_validator_num;
        this.precommit_voting_power = value.precommit_voting_power;
        this.total_voting_power = value.total_voting_power;
        this.latest_height = value.latest_height;
    }
}

export class BlockListReqDto extends PagingReqDto{
    static validate(value: any): void {
        super.validate(value);
    }

    static convert(value: any): any {
        super.convert(value);
        return value;
    }
}

export class BlockDetailReqDto extends BaseReqDto {
    @ApiProperty()
    height: number;

    static validate(value:any):void{
        if(!value || !value.height){
            throw new ApiError(ErrorCodes.InvalidParameter, 'height is necessary')
        }
    }

    static convert(value:any):any{
        value.height = Number(value.height);
        return value;
    }
}

// blocks/validatorset/{height}  req dto
export class ValidatorsetsReqDto extends PagingReqDto {
    @ApiProperty()
    height: number;

    static validate(value:any):void{
        if(!value || !value.height){
            throw new ApiError(ErrorCodes.InvalidParameter, 'height is necessary')
        }
    }

}
// blocks/validatorset/{height}  res dto
export class ValidatorsetsResDto {
    @ApiProperty()
    moniker: string;
    consensus: string;
    operator_address: string;
    proposer_priority: string;
    voting_power: string;
    is_proposer: boolean;

    constructor(value){
        let { moniker, address, operator_address, proposer_priority, voting_power, is_proposer } = value;
        this.moniker = moniker || "" ;
        this.consensus = address || "";
        this.operator_address = operator_address || "";
        this.proposer_priority = proposer_priority || "";
        this.voting_power = voting_power || "";
        this.is_proposer = is_proposer || false;
    }

    static bundleData(value: any): ValidatorsetsResDto[] {
        let data: ValidatorsetsResDto[] = [];
        data = value.map((v: any) => {
            return new ValidatorsetsResDto(v);
        });
        return data;
    }
}


