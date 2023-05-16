import * as mongoose from 'mongoose';
import {ICommonConfigStruct} from "../types/schemaTypes/common.config.interface";

export const CommonConfigSchema = new mongoose.Schema({
    config_name: String,
    value: String,
    description: String,
}, { versionKey: false });

CommonConfigSchema.statics = {
    async queryByConfigName(configName: string): Promise<ICommonConfigStruct> {
        return await this.findOne({config_name: configName})
    },
};