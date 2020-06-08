import { IsInt, IsString, IsNotEmpty } from 'class-validator';

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

export class BlockListReqDto {
    @IsInt()
    pageNum?: number;

    @IsInt()
    pageSize?: number;

    useCount: boolean;
}