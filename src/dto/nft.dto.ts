import { IsString, IsNotEmpty } from 'class-validator';
import { PagingReqDto } from './base.dto';
import { ApiProperty , ApiPropertyOptional} from '@nestjs/swagger';

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

    constructor(denom: string, id: string, owner: string, tokenUri: string, tokenData: string) {
        this.denom = denom;
        this.id = id;
        this.owner = owner;
        this.tokenUri = tokenUri;
        this.tokenData = tokenData;
    }

}

export class NftListResDto extends NftResDto {
    constructor(denom: string, id: string, owner: string, tokenUri: string, tokenData: string) {
        super(denom, id, owner, tokenUri, tokenData);
    }

}

export class NftDetailResDto extends NftResDto {
    constructor(denom: string, id: string, owner: string, tokenUri: string, tokenData: string) {
        super(denom, id, owner, tokenUri, tokenData);
    }
}

