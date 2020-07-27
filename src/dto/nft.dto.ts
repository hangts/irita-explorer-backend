import { IsString, IsNotEmpty } from 'class-validator';
import { PagingReqDto } from './base.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IDenomStruct } from '../types/schemaTypes/denom.interface';

export class NftListReqDto extends PagingReqDto {
    @ApiPropertyOptional()
    denom?: string;

    @ApiPropertyOptional()
    nftId?: string;

    @ApiPropertyOptional()
    owner?: string;


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
    denom_name: string;
    nft_name: string;

    constructor(denom: string, 
                id: string, 
                owner: string, 
                tokenUri: string, 
                tokenData: string, 
                denomDetail: IDenomStruct,
                denom_name: string,
                nft_name: string) {
        this.denom = denom;
        this.id = id;
        this.owner = owner;
        this.tokenUri = tokenUri;
        this.tokenData = tokenData;
        this.denomDetail = denomDetail;
        this.denom_name = denom_name;
        this.nft_name = nft_name;
    }

}

export class NftListResDto extends NftResDto {
    constructor(denom: string, 
                id: string, 
                owner: string, 
                tokenUri: string, 
                tokenData: string, 
                denomDetail: IDenomStruct,
                denom_name: string,
                nft_name: string) {
        super(denom, id, owner, tokenUri, tokenData, denomDetail, denom_name, nft_name);
    }

}

export class NftDetailResDto extends NftResDto {

    constructor(denom: string, 
                id: string, 
                owner: string, 
                tokenUri: string, 
                tokenData: string, 
                denomDetail: IDenomStruct,
                denom_name: string,
                nft_name: string) {
        super(denom, id, owner, tokenUri, tokenData, denomDetail, denom_name, nft_name);

    }
}

