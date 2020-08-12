import { IsString, IsNotEmpty } from 'class-validator';
import { PagingReqDto } from './base.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DenomResDto {
    name: string;
    denom_id: string;
    schema: string;
    creator: string;

    constructor(name: string, denom_id: string, schema: string, creator: string){
        this.name = name;
        this.denom_id = denom_id;
        this.schema = schema;
        this.creator = creator;
    }
}

export class DenomListResDto extends DenomResDto{
    constructor(name: string, denom_id: string, schema: string, creator: string){
        super(name, denom_id, schema, creator);
    }
}

export class DenomTxListReqDto extends PagingReqDto{
    @ApiPropertyOptional()
    denomNameOrId?: string;
}

export class DenomTxResDto {
    denomName: string;
    denomId: string;
    hash: string;
    nftCount: number;
    sender: string;
    time: number;

    constructor(
        denomName: string,
        denomId: string,
        hash: string,
        nftCount: number,
        sender: string,
        time: number,
    ){
        this.denomName = denomName;
        this.denomId = denomId;
        this.hash = hash;
        this.nftCount = nftCount;
        this.sender = sender;
        this.time = time;
    }
}

export class DenomTxListResDto extends DenomTxResDto{
    constructor(
        denomName: string,
        denomId: string,
        hash: string,
        nftCount: number,
        sender: string,
        time: number,
    ){
        super(denomName, denomId, hash, nftCount, sender,time);
    }
}