import { Document } from 'mongoose';

export interface IDenomStruct {
    name?: string,
    json_schema?: string,
    creator?: string,
    create_time?: number,
    update_time?: number,
}
export interface IDenom extends IDenomStruct, Document {
    
}