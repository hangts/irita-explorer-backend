import { IsInt, IsString, IsNotEmpty } from 'class-validator';
import { PagingReqDto } from './base.dto';

export class NftDto {

}

export class NftListReqDto extends PagingReqDto {
    denom: string;

    owner: string;
}

export class NftDetailReqDto {
    @IsString()
    @IsNotEmpty({message:'denom is necessary'})
    denom: string;

    @IsString()
    @IsNotEmpty({message:'nft is necessary'})
    nftId: string;
}


export class NftResDto {
    denom: string;
    id: string;
    owner: string;
    tokenUri: string;
    tokenData: string;
    createTime: number;
    updateTime: number;

    constructor(denom: string, id: string, owner: string, tokenUri: string, tokenData: string, createTime: number, updateTime: number) {
        this.denom = denom;
        this.id = id;
        this.owner = owner;
        this.tokenUri = tokenUri;
        this.tokenData = tokenData;
        this.createTime = createTime;
        this.updateTime = updateTime;
    }

}

export class NftListResDto extends NftResDto {
    constructor(denom: string, id: string, owner: string, tokenUri: string, tokenData: string, createTime: number, updateTime: number) {
        super(denom, id, owner, tokenUri, tokenData, createTime, updateTime);
    }

}

export class NftDetailResDto extends NftResDto {
    constructor(denom: string, id: string, owner: string, tokenUri: string, tokenData: string, createTime: number, updateTime: number) {
        super(denom, id, owner, tokenUri, tokenData, createTime, updateTime);
    }
}

