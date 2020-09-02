export interface IBaseIdentityStruct {
    id:string
}

export interface IIdentityStruct extends IBaseIdentityStruct{
    credentials: string,
    owner: string,
    create_block_time: string,
    create_block_height: string,
    create_tx_hash: string,
    update_block_time: string,
    update_block_height: string,
    update_tx_hash: string,
    create_time?: number,
    update_time?: number
}
export interface IIdentityPubKeyStruct extends IBaseIdentityStruct {
    pubkey: object,
    hash: string,
    height: number,
    time: number,
    msg_index: number,
    create_time?: number,
}
export interface IIdentityCertificateStruct extends IBaseIdentityStruct{
    certificate:string,
    hash: string,
    height: number,
    time: number,
    msg_index:number,
    create_time?: number,
}

export interface IUpDateIdentityCredentials extends IBaseIdentityStruct {
    credentials?:string
    update_block_time: string,
    update_block_height: string,
    update_tx_hash: string,
    update_time?: number
}
