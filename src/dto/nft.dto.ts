import { IsString, IsNotEmpty } from 'class-validator';
import { PagingReqDto } from './base.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IDenomStruct } from '../types/schemaTypes/denom.interface';

export class NftListReqDto extends PagingReqDto {
    @ApiPropertyOptional()
    denom?: string;

    @ApiPropertyOptional()
    nftId?: string;
}

export class NftDetailReqDto {
    @IsString()
    @ApiProperty()
    @IsNotEmpty({ message: 'denom is necessary' })
    denom: string;

    @IsString()
    @ApiProperty()
    @IsNotEmpty({ message: 'nft is necessary' })
    nftId: string;
}


export class NftResDto {
    denom: string;
    id: string;
    owner: string;
    tokenUri: string;
    tokenData: string;
    denomDetail: IDenomStruct;

    constructor(denom: string, id: string, owner: string, tokenUri: string, tokenData: string, denomDetail: IDenomStruct) {
        this.denom = denom;
        this.id = id;
        this.owner = owner;
        this.tokenUri = tokenUri;
        this.tokenData = tokenData;
        this.denomDetail = denomDetail;
    }

}

export class NftListResDto extends NftResDto {
    constructor(denom: string, id: string, owner: string, tokenUri: string, tokenData: string, denomDetail: IDenomStruct) {
        super(denom, id, owner, tokenUri, tokenData, denomDetail);
    }

}

export class NftDetailResDto extends NftResDto {

    constructor(denom: string, id: string, owner: string, tokenUri: string, tokenData: string, denomDetail: IDenomStruct) {
        super(denom, id, owner, tokenUri, tokenData, denomDetail);

    }
}

