import { BaseReqDto, PagingReqDto } from './base.dto';
import { ApiError } from '../api/ApiResult';
import { ErrorCodes } from '../api/ResultCodes';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Coin } from './common.res.dto';

export class RangeBlockReqDto extends BaseReqDto{

  @ApiPropertyOptional()
  start?: number;

  @ApiPropertyOptional()
  end?: number;

  @ApiPropertyOptional({description:'true/false'})
  useCount?: boolean;

  static validate(value: any): void {
      const patt = /^[1-9]\d*$/;
      if (value.start && (!patt.test(value.start) || value.start < 1)) {
          throw new ApiError(ErrorCodes.InvalidParameter, 'The start must be a positive integer greater than 0');
      }
      if (value.end && (!patt.test(value.end) || value.end < 1)) {
          throw new ApiError(ErrorCodes.InvalidParameter, 'The end must be a positive integer greater than 0');
      }
  }

  static convert(value: any): any {
      if(!value.useCount){
          value.useCount = false;
      }else {
          if(value.useCount === 'true'){
              value.useCount = true;
          }else {
              value.useCount = false;
          }
      }
      value.start = value.start && Number(value.start);
      value.end = value.end && Number(value.end);
      return value;
  }
}

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
    proposer?: string;
    total_validator_num?: number;
    total_voting_power?: number;
    precommit_voting_power?: number;
    precommit_validator_num?: number;
    proposer_moniker?: string;
    proposer_addr?: string;

    constructor(value) {
        super(value.height, value.hash, value.txn, value.time);
        this.total_validator_num = value.total_validator_num;
        this.total_voting_power = value.total_voting_power;
        this.precommit_voting_power = value.precommit_voting_power;
        this.precommit_validator_num = value.precommit_validator_num;
        this.proposer_moniker = value.proposer_moniker;
        this.proposer_addr = value.proposer_addr;
    }
}

// blocks/staking/:height
export class BlockStakingResDto {
    height: string;
    time: number;
    hash: string;
    txn: string;
    proposer_moniker: string;
    proposer_addr: string;
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
        this.proposer_moniker = value.proposer_moniker;
        this.proposer_addr = value.proposer_addr;
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
        const { moniker, address, operator_address, proposer_priority, voting_power, is_proposer } = value;
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


