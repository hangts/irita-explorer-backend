import { DeepPagingReqDto } from './base.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IDdcStruct } from '../types/schemaTypes/ddc.interface';

export class DdcListReqDto extends DeepPagingReqDto {
  @ApiPropertyOptional()
  ddc_id?: string;

  @ApiPropertyOptional()
  contract_address?: string;

  @ApiPropertyOptional()
  owner?: string;

  @ApiPropertyOptional()
  type?: string;

}

export class DdcDetailReqDto {
  @IsString()
  @ApiProperty()
  @IsNotEmpty({ message: 'contract_address is necessary' })
  contract_address: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty({ message: 'ddc id is necessary' })
  ddc_id: string;
}


export class DdcResDto {
  ddc_id: number;
  contract_address: string;
  owner: string;
  creator: string;
  ddc_uri: string;
  ddc_data: string;
  ddc_type: number;
  ddc_name: string;
  amount: number;

  constructor(
    contract_address: string,
    ddc_id: number,
    owner: string,
    creator: string,
    ddc_uri: string,
    ddc_data: string,
    ddc_type: number,
    ddc_name: string,
    amount: number,
  ) {
    this.ddc_id = ddc_id;
    this.contract_address = contract_address;
    this.owner = owner;
    this.creator = creator;
    this.ddc_uri = ddc_uri;
    this.ddc_data = ddc_data;
    this.ddc_type = ddc_type;
    this.ddc_name = ddc_name;
    this.amount = amount;
  }
}

export class DdcListResDto extends DdcResDto {
  lastest_tx_time: number;
  is_delete: boolean;
  is_freeze: boolean;

  constructor(
    ddc_id: number,
    contract_address: string,
    owner: string,
    creator: string,
    ddc_uri: string,
    ddc_data: string,
    ddc_type: number,
    ddc_name: string,
    amount: number,
    lastest_tx_time: number,
    is_delete: boolean,
    is_freeze: boolean
  ) {
    super(contract_address, ddc_id, owner,creator, ddc_uri, ddc_data, ddc_type, ddc_name,amount);
    this.lastest_tx_time = lastest_tx_time;
    this.is_delete = is_delete;
    this.is_freeze = is_freeze;
  }

}

export class DdcDetailResDto extends DdcResDto {

  constructor(
    ddc_id: number,
    contract_address: string,
    owner: string,
    creator: string,
    ddc_uri: string,
    ddc_data: string,
    ddc_type: number,
    ddc_name: string,
    amount: number,
  ) {
    super(contract_address, ddc_id, owner, creator, ddc_uri, ddc_data, ddc_type, ddc_name,amount);
  }
}