import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from "mongoose";
import {StatisticsNames, TaskEnum} from '../constant';
import { INft } from '../types/schemaTypes/nft.interface';
import { StatisticsType } from '../types/schemaTypes/statistics.interface';
import { getTimestamp } from '../util/util';
import { StakingHttp } from '../http/lcd/staking.http';
import { BankHttp } from '../http/lcd/bank.http';
import { DistributionHttp } from '../http/lcd/distribution.http';
import {CronTaskWorkingStatusMetric} from "../monitor/metrics/cron_task_working_status.metric";
import {cfg} from "../config/config";


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
    @InjectModel('Tokens') private tokensModel: Model<any>,
    private readonly cronTaskWorkingStatusMetric: CronTaskWorkingStatusMetric,
  ) {
    this.doTask = this.doTask.bind(this);
    this.cronTaskWorkingStatusMetric.collect(TaskEnum.statistics,0)
  }
  async doTask(): Promise<void> {
    let service_all, nft_all ,validator_all ,validator_active ,identity_all ,denom_all,bonded_tokens,total_supply;
    const tx_all = await this.queryTxCount()

    if (cfg && cfg.taskCfg &&  cfg.taskCfg.CRON_JOBS) {
      if (cfg.taskCfg.CRON_JOBS.indexOf(TaskEnum.denom) >= 0) {
        denom_all = await this.queryDenomCount()
      }
      if (cfg.taskCfg.CRON_JOBS.indexOf(TaskEnum.nft) >= 0) {
        nft_all = await this.queryAssetCount()
      }
      if (cfg.taskCfg.CRON_JOBS.indexOf(TaskEnum.identity) >= 0) {
        identity_all = await this.queryIdentityCount()
      }
      if (cfg.taskCfg.CRON_JOBS.indexOf(TaskEnum.txServiceName) >= 0) {
        service_all = await this.queryServiceCount()
      }
      if (cfg.taskCfg.CRON_JOBS.indexOf(TaskEnum.validators) >= 0) {
        validator_all = await this.queryConsensusValidatorCount()
      }
      if (cfg.taskCfg.CRON_JOBS.indexOf(TaskEnum.stakingSyncValidatorsInfo) >= 0) {
        validator_active = await this.queryValidatorNumCount()
      }
      if (cfg.taskCfg.CRON_JOBS.indexOf(TaskEnum.tokens) >= 0) {
        const { bondedTokens, totalSupply } = await this.queryBondedTokensInformation()
        bonded_tokens = bondedTokens
        total_supply = totalSupply
      }
    }

    // const [
    //   tx_all, service_all, nft_all,
    //   validator_all, validator_active,
    //   identity_all, denom_all
    // ] = await Promise.all([
    //   this.queryTxCount(), this.queryServiceCount(), this.queryAssetCount(),
    //     this.queryConsensusValidatorCount(), this.queryValidatorNumCount(),
    //     this.queryIdentityCount(), this.queryDenomCount()
    //   ]);

    const community_pool = await this.queryCommunityPool()

    const parseCount = {
      tx_all,
      service_all,
      nft_all,
      validator_all,
      validator_active,
      identity_all,
      denom_all,
      bonded_tokens,
      total_supply,
    };
    let data = ''

    for (const statistics_name of StatisticsNames) {
      if (statistics_name === 'community_pool' && community_pool) {
        data = JSON.stringify(community_pool)
      }

      const statisticsRecord = await this.findStatisticsRecord(
        statistics_name,
      );
      if (!statisticsRecord) {
        await this.statisticsModel.insertManyStatisticsRecord({
          statistics_name,
          count: parseCount[statistics_name],
          data,
          create_at: getTimestamp(),
          update_at: getTimestamp(),
        });
      } else {
        statisticsRecord.count = parseCount[statistics_name];
        statisticsRecord.update_at = getTimestamp();
        statisticsRecord.data = data
        await this.updateStatisticsRecord(statisticsRecord);
      }
    }
    this.cronTaskWorkingStatusMetric.collect(TaskEnum.statistics,1)
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

  async queryBondedTokensInformation(): Promise<any>{
    const [bondedTokensLcd,totalSupplyLcd] = await Promise.all([StakingHttp.getBondedTokens(),BankHttp.getTotalSupply()])
    const bondedTokens = bondedTokensLcd && bondedTokensLcd.bonded_tokens || '0'
    const mainToken = await (this.tokensModel as any).queryMainToken()
    let totalSupply: string = '0';
    if (mainToken) {
      if (totalSupplyLcd && totalSupplyLcd.supply && totalSupplyLcd.supply.length > 0) {
        totalSupplyLcd.supply.map(item => {
          if (item.denom === mainToken.denom) {
            totalSupply = item.amount
          }
        })
      }
    }
    return { bondedTokens, totalSupply };
  }

  async queryCommunityPool(): Promise<any> {
    const communityPools = await DistributionHttp.getCommunityPool()
    if (communityPools && communityPools.pool) {
      return communityPools.pool
    }
    return []
  }

}