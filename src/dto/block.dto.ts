import { BaseReqDto, PagingReqDto } from './base.dto';
import { ApiError } from '../api/ApiResult';
import { ErrorCodes } from '../api/ResultCodes';
import { ApiProperty } from '@nestjs/swagger';

export class BlockResDto {
    height: number;
    hash: string;
    txn: number;
    time: string;

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