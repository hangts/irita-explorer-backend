export interface TaskCallback {
    (): Promise<void>;
}

export interface ILcdNftStruct {
    id: string;
    name:string;
    owner: string;
    data: string;
    uri?: string;
    hash?: string;
    denom_id? :string;
    denom_name? :string;
}