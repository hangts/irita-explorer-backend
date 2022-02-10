import * as mongoose from 'mongoose';
import { StatisticsType } from '../types/schemaTypes/statistics.interface';

export const StatisticsSchema = new mongoose.Schema(
  {
    statistics_name: String,
    count: Number,
    create_at: {
      type: Number,
      default: Math.floor(new Date().getTime() / 1000),
    },
    update_at: {
      type: Number,
      default: Math.floor(new Date().getTime() / 1000),
    },
  },
  { versionKey: false },
);

StatisticsSchema.index({ statistics_name: 1 }, { unique: true });

StatisticsSchema.statics = {
  async findStatisticsRecord(
    statistics_name: string,
  ): Promise<StatisticsType> {
    return this.findOne({ statistics_name }, { _id: 0 });
  },

  async findAllRecord(): Promise<StatisticsType[]> {
    return this.find();
  },

  async updateStatisticsRecord(
    statisticsRecord: StatisticsType,
    cb,
  ): Promise<void> {
    const { statistics_name } = statisticsRecord;
    const options = { upsert: true, new: false, setDefaultsOnInsert: true };
    return this.findOneAndUpdate(
      { statistics_name },
      statisticsRecord,
      options,
      cb,
    );
  },

  async insertManyStatisticsRecord(
    statisticsRecord: StatisticsType,
  ): Promise<void> {
    return this.insertMany(statisticsRecord, { ordered: false });
  },
};