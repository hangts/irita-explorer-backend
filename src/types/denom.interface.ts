import { Document } from 'mongoose';
export interface IDenomEntities extends Document {
    name: string,
    json_schema: string,
    creator: string,
    create_time: number,
    update_time: number,
}