import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from "mongoose";
import {StatisticsNames, TaskEnum} from '../constant';
import {INft} from '../types/schemaTypes/nft.interface';
import {StatisticsType, AllTxStatisticsInfoType} from '../types/schemaTypes/statistics.interface';
import {getTimestamp} from '../util/util';
import {StakingHttp} from '../http/lcd/staking.http';
import {BankHttp} from '../http/lcd/bank.http';
import {DistributionHttp} from '../http/lcd/distribution.http';
import {CronTaskWorkingStatusMetric} from "../monitor/metrics/cron_task_working_status.metric";
import {cfg} from "../config/config";
import {getTaskStatus} from '../helper/task.helper';
import {ITxStruct} from "../types/schemaTypes/tx.interface";


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
        @InjectModel('SyncTask') private taskModel: any,
        private readonly cronTaskWorkingStatusMetric: CronTaskWorkingStatusMetric,
    ) {
        this.doTask = this.doTask.bind(this);
        this.cronTaskWorkingStatusMetric.collect(TaskEnum.statistics, 0)
    }

    async doTask(): Promise<void> {
        let service_all, nft_all, validator_all, validator_active, identity_all, denom_all, bonded_tokens,
            total_supply;

        await this.updateIncreTxCount()

        if (cfg && cfg.taskCfg && cfg.taskCfg.CRON_JOBS) {
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
                const {bondedTokens, totalSupply} = await this.queryBondedTokensInformation()
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
                    statistics_info: '',
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
        this.cronTaskWorkingStatusMetric.collect(TaskEnum.statistics, 1)
    }

    async updateStatisticsRecord(statisticsRecord: StatisticsType) {
        await this.statisticsModel.updateStatisticsRecord(statisticsRecord);
    }

    async findStatisticsRecord(statistics_name: string): Promise<StatisticsType> {
        return await this.statisticsModel.findStatisticsRecord(
            statistics_name,
        );
    }

    async queryAssetCount(): Promise<number | null> {
        return await this.nftModel.findCount();
    }

    async queryConsensusValidatorCount(): Promise<number | null> {
        return await this.validatorModel.findCount(false);
    }

    async updateIncreTxCount(): Promise<void> {
        let follow: boolean = await getTaskStatus(this.taskModel, TaskEnum.statistics)
        if (follow) {
            let statisticsRecord = await this.findStatisticsRecord('tx_all');
            if (!statisticsRecord) {
                let statisticsRecord = {
                    statistics_name: 'tx_all',
                    count: 0,
                    data: '',
                    statistics_info: '',
                    create_at: getTimestamp(),
                    update_at: getTimestamp(),
                }
                const latestOneTx: ITxStruct = await this.txModel.queryLatestHeight(1)
                if (latestOneTx && latestOneTx?.height) {
                    let txAllInfo = {record_height: 0, record_height_block_txs: 0}
                    txAllInfo.record_height = latestOneTx?.height
                    txAllInfo.record_height_block_txs = await this.txModel.queryTxCountWithHeight(latestOneTx?.height)
                    statisticsRecord.statistics_info = JSON.stringify(txAllInfo)
                }
                statisticsRecord.count = await this.txModel.queryTxCountStatistics();
                await this.statisticsModel.insertManyStatisticsRecord(statisticsRecord);
            } else {
                let increTxCnt = 0;
                if (statisticsRecord?.statistics_info) {
                    const txAllInfo: AllTxStatisticsInfoType = JSON.parse(statisticsRecord.statistics_info);
                    if (txAllInfo?.record_height && txAllInfo?.record_height_block_txs) {
                        const incre = await this.txModel.queryIncreTxCount(txAllInfo.record_height)
                        const latestOneTx: ITxStruct = await this.txModel.queryLatestHeight(txAllInfo.record_height)
                        if (incre && incre > txAllInfo.record_height_block_txs) {
                            // 统计增量数 =  incre - record_height_block_txs
                            increTxCnt = incre - txAllInfo.record_height_block_txs
                        }
                        if (latestOneTx && latestOneTx?.height) {
                            txAllInfo.record_height = latestOneTx?.height
                            txAllInfo.record_height_block_txs = await this.txModel.queryTxCountWithHeight(latestOneTx?.height)
                            statisticsRecord.statistics_info = JSON.stringify(txAllInfo)
                        }
                        //交易总数 = 统计增量数+历史统计总数
                        if (increTxCnt > 0) {
                            statisticsRecord.count = statisticsRecord.count + increTxCnt;
                            statisticsRecord.update_at = getTimestamp();
                            await this.updateStatisticsRecord(statisticsRecord);
                        }
                    }
                } else {
                    const latestOneTx: ITxStruct = await this.txModel.queryLatestHeight(1)
                    if (latestOneTx && latestOneTx?.height) {
                        let txAllInfo = {record_height: 0, record_height_block_txs: 0}
                        txAllInfo.record_height = latestOneTx?.height
                        txAllInfo.record_height_block_txs = await this.txModel.queryTxCountWithHeight(latestOneTx?.height)
                        statisticsRecord.statistics_info = JSON.stringify(txAllInfo)
                    }
                    statisticsRecord.count = await this.txModel.queryTxCountStatistics();
                    await this.updateStatisticsRecord(statisticsRecord);
                }
            }

        }
    }

    async queryServiceCount(): Promise<number | null> {
        return await this.txModel.queryServiceCountStatistics();
    }

    async queryIdentityCount(): Promise<number | null> {
        return await this.identityModel.queryIdentityCount();
    }

    async queryDenomCount(): Promise<number | null> {
        return await this.denomModel.queryAllCount();
    }

    async queryValidatorNumCount(): Promise<number | null> {
        return await this.stakingValidatorsModel.queryActiveValCount();
    }

    async queryBondedTokensInformation(): Promise<any> {
        const [bondedTokensLcd, totalSupplyLcd] = await Promise.all([StakingHttp.getBondedTokens(), BankHttp.getTotalSupply()])
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
        return {bondedTokens, totalSupply};
    }

    async queryCommunityPool(): Promise<any> {
        const communityPools = await DistributionHttp.getCommunityPool()
        if (communityPools && communityPools.pool) {
            return communityPools.pool
        }
        return []
    }

}