import { Document } from 'mongoose';
import { IDenomStruct } from './denom.interface';
export interface IDeleteQuery {
    denom: string,
    nft_id: string,
}

export interface INftStruct {
    denom?: string,
    nft_id?: string,
    owner?: string,
    token_uri?: string,
    token_data?: string,
    create_time?: number,
    update_time?: number,
    hash?: string,
}
export interface INftCountQueryParams {
    denom?: string;
    nftId?: string;
    owner?: string;
}

export interface INftDetailStruct extends INftStruct{
    denomDetail: IDenomStruct,
}

export interface INftListStruct extends INftStruct{
    denomDetail: IDenomStruct,
}



export interface INft extends INftStruct,Document {

}