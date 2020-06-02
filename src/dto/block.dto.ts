interface BlockBaseDto {
    height:number;
    hash:string;
    txn:number;
    time:string;
}

export interface BlockDto extends BlockBaseDto{
}