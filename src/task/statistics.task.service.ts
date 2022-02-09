import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from "mongoose";
import {StatisticsNames} from '../constant';
import { INft } from '../types/schemaTypes/nft.interface';
import { StatisticsType } from '../types/schemaTypes/statistics.interface';
import { getTimestamp } from '../util/util';



@Injectable()
export class StatisticsTaskService {
  constructor(
    @InjectModel('Nft') private nftModel: Model<INft>,
    @InjectModel('Tx') private txModel: any,
    @InjectModel('Statistics') private statisticsModel: any,
    @InjectModel('Validators') private validatorModel: any,
    @InjectModel('Identity') private identityModel: any,
    @InjectModel('Denom') private denomModel: any,
    @InjectModel('StakingSyncValidators') private stakingValidatorsModel: any,
  ) {
    this.doTask = this.doTask.bind(this);
  }
  async doTask(): Promise<void> {
    const tx_all = await this.queryTxCount()
    const service_all = await this.queryServiceCount()
    const nft_all = await this.queryAssetCount()
    const validator_all = await this.queryConsensusValidatorCount()
    const validator_active = await this.queryValidatorNumCount()
    const identity_all = await this.queryIdentityCount()
    const denom_all = await this.queryDenomCount()

    const parseCount = {
      tx_all,
      service_all,
      nft_all,
      validator_all,
      validator_active,
      identity_all,
      denom_all,
    };

    for (const statistics_name of StatisticsNames) {

      const statisticsRecord = await this.findStatisticsRecord(
        statistics_name,
      );
      if (!statisticsRecord) {
        await this.statisticsModel.insertManyStatisticsRecord({
          statistics_name,
          count: parseCount[statistics_name],
          statistics_info:'',
          create_at: getTimestamp(),
          update_at: getTimestamp(),
        });
      } else {
        statisticsRecord.count = parseCount[statistics_name];
        statisticsRecord.update_at = getTimestamp();
        await this.updateStatisticsRecord(statisticsRecord);
      }
    }

  }

  async updateStatisticsRecord(statisticsRecord: StatisticsType) {
    await this.statisticsModel.updateStatisticsRecord(statisticsRecord);
  }

  async findStatisticsRecord(statistics_name: string): Promise<StatisticsType> {
    return await this.statisticsModel.findStatisticsRecord(
      statistics_name,
    );
  }

  async queryAssetCount(): Promise<number | null>{
    return await this.nftModel.findCount();
  }

  async queryConsensusValidatorCount(): Promise<number | null>{
    return await this.validatorModel.findCount(false);
  }

  async queryTxCount():Promise<number | null>{
    return await this.txModel.queryTxCountStatistics();
  }

  async queryServiceCount():Promise<number | null>{
    return await this.txModel.queryServiceCountStatistics();
  }

  async queryIdentityCount():Promise<number | null>{
    return await this.identityModel.queryIdentityCount();
  }

  async queryDenomCount():Promise<number | null>{
    return await this.denomModel.queryAllCount();
  }

  async queryValidatorNumCount():Promise<number | null>{
    return await this.stakingValidatorsModel.queryActiveValCount();
  }
}