export interface TaskCallback {
    (): Promise<void>;
}

export interface ILcdNftStruct {
    id: string;
    owner: string;
    token_data: string;
    token_uri?: string;
    hash?: string;
}