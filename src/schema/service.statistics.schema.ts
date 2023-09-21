import * as mongoose from 'mongoose';
import {getTimestamp} from "../util/util";
import {IServiceStatisticsStruct} from "../types/schemaTypes/service.statistics.interface";
import {countServiceTxHelper} from "../helper/params.helper";

export const ServiceStatisticsSchema = new mongoose.Schema({
    service_name: String,
    type: String,
    status: Number,
    provider: String,
    count: Number,
    create_time: Number,
    update_time: Number,
}, {versionKey: false});

ServiceStatisticsSchema.statics = {
    async updateServiceProviderCount(
        serviceName: string,
        provider: string,
        count: number
    ): Promise<void> {
        return this.findOneAndUpdate(
            {service_name: serviceName, provider: provider},
            {
                $inc: {count: count},
                $set: {create_time: getTimestamp(), update_time: getTimestamp()}
            },
            {upsert: true, new: true, setDefaultsOnInsert: true}
        );
    },

    async findProviderRespondTimesByServiceName(serviceName: string, providerArr: any[]): Promise<IServiceStatisticsStruct[]> {
        return await this.find(
            {
                'service_name': serviceName,
                'provider': {
                    $in: providerArr,
                }
            });
    },

    async updateServiceTxCount(
        serviceName: string,
        txType: string,
        status: number,
        count: number
    ): Promise<void> {
        return this.findOneAndUpdate(
            {service_name: serviceName, type: txType, status: status},
            {
                $inc: {count: count},
                $set: {create_time: getTimestamp(), update_time: getTimestamp()}
            },
            {upsert: true, new: true, setDefaultsOnInsert: true}
        );
    },

    async findTxCount(serviceName: string, type: string, status: string): Promise<any> {
        const cond = countServiceTxHelper(serviceName, type, status)

        return this.aggregate([
            {
                $match: cond,
            },
            {
                $group: {
                    _id: null,
                    count: {
                        $sum: '$count'
                    },
                }
            },
            {
                $project: {
                    _id: 0,
                    count: 1,
                },
            }
        ]);
    },
};