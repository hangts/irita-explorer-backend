import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StatisticsNames, TaskEnum, TxsListCountName } from '../constant';
import { INft } from '../types/schemaTypes/nft.interface';
import {
    AllDenomStatisticsInfoType,
    AllMsgsStatisticsInfoType,
    AllTxStatisticsInfoType,
    StatisticsType,
} from '../types/schemaTypes/statistics.interface';
import { getTimestamp } from '../util/util';
import { StakingHttp } from '../http/lcd/staking.http';
import { BankHttp } from '../http/lcd/bank.http';
import { DistributionHttp } from '../http/lcd/distribution.http';
import { CronTaskWorkingStatusMetric } from '../monitor/metrics/cron_task_working_status.metric';
import { cfg } from '../config/config';
import { getTaskStatus } from '../helper/task.helper';
import { globalAccountNumber } from '../helper/staking.helper';
import { ITxStruct } from '../types/schemaTypes/tx.interface';
import { IDenomStruct } from '../types/schemaTypes/denom.interface';


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
        let service_all, nft_all, validator_all, validator_active, identity_all, bonded_tokens,
            total_supply;

        const txStatusSuccess = "1",txStatusFailed = "2";
        await Promise.all([
            this.updateIncreTxCount(),this.updateIncreTxCount(txStatusSuccess),this.updateIncreTxCount(txStatusFailed),
            this.updateIncreMsgsCount(),this.updateIncreMsgsCount(txStatusSuccess),this.updateIncreMsgsCount(txStatusFailed)
       ]);

        if (cfg && cfg.taskCfg && cfg.taskCfg.CRON_JOBS) {
            if (cfg.taskCfg.CRON_JOBS.indexOf(TaskEnum.denom) >= 0) {
                await this.updateIncreDenomCount()
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
        const accounts_all = await this.queryAccounts()

        const parseCount = {
            service_all,
            nft_all,
            validator_all,
            validator_active,
            identity_all,
            bonded_tokens,
            total_supply,
            accounts_all,
        };


        for (const statistics_name of StatisticsNames) {
            let data = ''
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

    async handleTxMsgsIncre(statisticsRecord,status?:string):Promise<any>{
        const latestOneTx: ITxStruct = await this.txModel.queryLatestHeight(1,status)
        if (latestOneTx && latestOneTx?.height) {
            let msgAllInfo = {record_height: 0, record_height_tx_msgs: 0}
            msgAllInfo.record_height = latestOneTx?.height
            const data = await this.txModel.queryTxMsgsCountByHeight(latestOneTx?.height,status)
            if (data && data?.length) {
                msgAllInfo.record_height_tx_msgs = data[0].count
            }
            statisticsRecord.statistics_info = JSON.stringify(msgAllInfo)
            const Incredata = await this.txModel.queryTxMsgsIncre(1,status);
            if (Incredata && Incredata?.length) {
                statisticsRecord.count = Incredata[0].count
            }
        }
        return statisticsRecord
    }

    async updateIncreMsgsCount(status?:string) {
        let statisticsName = TxsListCountName.txMsgsAll
        if (status && status.length) {
            switch (status) {
                case "1"://success
                    statisticsName = TxsListCountName.txMsgsAllSuccess
                    break;
                case "2"://failed
                    statisticsName = TxsListCountName.txMsgsAllFailed
                    break;
            }
        }
        let follow: boolean = await getTaskStatus(this.taskModel, TaskEnum.statistics)
        if (follow) {
            let statisticsRecord = await this.findStatisticsRecord(statisticsName);
            if (!statisticsRecord) {
                let statisticsRecord = {
                    statistics_name: statisticsName,
                    count: 0,
                    data: '',
                    statistics_info: '',
                    create_at: getTimestamp(),
                    update_at: getTimestamp(),
                }
                statisticsRecord = await this.handleTxMsgsIncre(statisticsRecord,status)
                await this.statisticsModel.insertManyStatisticsRecord(statisticsRecord);
            } else {
                let increMsgsCnt = 0;
                if (statisticsRecord?.statistics_info) {
                    const msgsAllInfo: AllMsgsStatisticsInfoType = JSON.parse(statisticsRecord.statistics_info);
                    if (msgsAllInfo?.record_height && msgsAllInfo?.record_height_tx_msgs) {
                        const increData = await this.txModel.queryTxMsgsIncre(msgsAllInfo.record_height,status)
                        let incre = 0
                        if (increData && increData.length) {
                            incre = Number(increData[0].count)
                        }
                        if (incre && incre > msgsAllInfo.record_height_tx_msgs) {
                            // 统计增量数 =  incre - record_height_tx_msgs
                            increMsgsCnt = incre - msgsAllInfo.record_height_tx_msgs
                        }

                        const latestOneTx: ITxStruct = await this.txModel.queryLatestHeight(msgsAllInfo.record_height,status)
                        if (latestOneTx && latestOneTx?.height) {
                            msgsAllInfo.record_height = latestOneTx?.height
                            const increData = await this.txModel.queryTxMsgsCountByHeight(latestOneTx?.height,status)
                            if (increData && increData.length) {
                                msgsAllInfo.record_height_tx_msgs = Number(increData[0].count)
                            }
                            statisticsRecord.statistics_info = JSON.stringify(msgsAllInfo)
                        }
                        //交易消息总数 = 统计增量数+历史统计总数
                        if (increMsgsCnt > 0) {
                            statisticsRecord.count = statisticsRecord.count + increMsgsCnt;
                            statisticsRecord.update_at = getTimestamp();
                            await this.updateStatisticsRecord(statisticsRecord);
                        }
                    }
                } else {
                    statisticsRecord = await this.handleTxMsgsIncre(statisticsRecord,status)
                    await this.updateStatisticsRecord(statisticsRecord);
                }
            }

        }
    }

    async updateIncreTxCount(status?:string): Promise<void> {
        let statisticsName = TxsListCountName.txAll
        if (status && status.length) {
            switch (status) {
                case "1"://success
                    statisticsName = TxsListCountName.txAllSuccess
                    break;
                case "2"://failed
                    statisticsName = TxsListCountName.txAllFailed
                    break;
            }
        }
        let follow: boolean = await getTaskStatus(this.taskModel, TaskEnum.statistics)
        if (follow) {
            let statisticsRecord = await this.findStatisticsRecord(statisticsName);
            if (!statisticsRecord) {
                let statisticsRecord = {
                    statistics_name: statisticsName,
                    count: 0,
                    data: '',
                    statistics_info: '',
                    create_at: getTimestamp(),
                    update_at: getTimestamp(),
                }
                const latestOneTx: ITxStruct = await this.txModel.queryLatestHeight(1,status)
                if (latestOneTx && latestOneTx?.height) {
                    let txAllInfo = {record_height: 0, record_height_block_txs: 0}
                    txAllInfo.record_height = latestOneTx?.height
                    txAllInfo.record_height_block_txs = await this.txModel.queryTxCountWithHeight(latestOneTx?.height,status)
                    statisticsRecord.statistics_info = JSON.stringify(txAllInfo)
                }
                statisticsRecord.count = await this.txModel.queryTxCountStatistics(status);
                await this.statisticsModel.insertManyStatisticsRecord(statisticsRecord);
            } else {
                let increTxCnt = 0;
                if (statisticsRecord?.statistics_info) {
                    const txAllInfo: AllTxStatisticsInfoType = JSON.parse(statisticsRecord.statistics_info);
                    if (txAllInfo?.record_height && txAllInfo?.record_height_block_txs) {
                        const incre = await this.txModel.queryIncreTxCount(txAllInfo.record_height,status)
                        const latestOneTx: ITxStruct = await this.txModel.queryLatestHeight(txAllInfo.record_height,status)
                        if (incre && incre > txAllInfo.record_height_block_txs) {
                            // 统计增量数 =  incre - record_height_block_txs
                            increTxCnt = incre - txAllInfo.record_height_block_txs
                        }
                        if (latestOneTx && latestOneTx?.height) {
                            txAllInfo.record_height = latestOneTx?.height
                            txAllInfo.record_height_block_txs = await this.txModel.queryTxCountWithHeight(latestOneTx?.height,status)
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
                    const latestOneTx: ITxStruct = await this.txModel.queryLatestHeight(1,status)
                    if (latestOneTx && latestOneTx?.height) {
                        let txAllInfo = {record_height: 0, record_height_block_txs: 0}
                        txAllInfo.record_height = latestOneTx?.height
                        txAllInfo.record_height_block_txs = await this.txModel.queryTxCountWithHeight(latestOneTx?.height,status)
                        statisticsRecord.statistics_info = JSON.stringify(txAllInfo)
                    }
                    statisticsRecord.count = await this.txModel.queryTxCountStatistics(status);
                    await this.updateStatisticsRecord(statisticsRecord);
                }
            }

        }
    }

    async updateIncreDenomCount(): Promise<void> {
        let follow: boolean = await getTaskStatus(this.taskModel, TaskEnum.statistics)
        if (follow) {
            let statisticsRecord = await this.findStatisticsRecord("denom_all");
            if (!statisticsRecord) {
                let statisticsRecord = {
                    statistics_name: "denom_all",
                    count: 0,
                    data: '',
                    statistics_info: '',
                    create_at: getTimestamp(),
                    update_at: getTimestamp(),
                }
                const latestOneNftDenom: IDenomStruct = await this.denomModel.queryLatestHeight(1)
                if (latestOneNftDenom && latestOneNftDenom?.height) {
                    let denomAllInfo = {record_height: 0, record_height_denoms: 0}
                    denomAllInfo.record_height = latestOneNftDenom?.height
                    denomAllInfo.record_height_denoms = await this.denomModel.queryDenomCountWithHeight(latestOneNftDenom?.height)
                    statisticsRecord.statistics_info = JSON.stringify(denomAllInfo)
                }
                statisticsRecord.count = await this.denomModel.queryAllCount();
                await this.statisticsModel.insertManyStatisticsRecord(statisticsRecord);
            } else {
                let increTxCnt = 0;
                if (statisticsRecord?.statistics_info) {
                    const denomAllInfo: AllDenomStatisticsInfoType = JSON.parse(statisticsRecord.statistics_info);
                    if (denomAllInfo?.record_height && denomAllInfo?.record_height_denoms) {
                        const incre = await this.denomModel.queryIncreDenomCount(denomAllInfo.record_height)
                        const latestOneNftDenom: IDenomStruct = await this.denomModel.queryLatestHeight(denomAllInfo.record_height)
                        if (incre && incre > denomAllInfo.record_height_denoms) {
                            // 统计denom增量数 =  incre - record_height_denoms
                            increTxCnt = incre - denomAllInfo.record_height_denoms
                        }
                        if (latestOneNftDenom && latestOneNftDenom?.height) {
                            denomAllInfo.record_height = latestOneNftDenom?.height
                            denomAllInfo.record_height_denoms = await this.denomModel.queryDenomCountWithHeight(latestOneNftDenom?.height)
                            statisticsRecord.statistics_info = JSON.stringify(denomAllInfo)
                        }
                        //denom总数 = 统计增量数+历史统计总数
                        if (increTxCnt > 0) {
                            statisticsRecord.count = statisticsRecord.count + increTxCnt;
                            statisticsRecord.update_at = getTimestamp();
                            await this.updateStatisticsRecord(statisticsRecord);
                        }
                    }
                } else {
                    const latestOneNftDenom: IDenomStruct = await this.denomModel.queryLatestHeight(1)
                    if (latestOneNftDenom && latestOneNftDenom?.height) {
                        let denomAllInfo = {record_height: 0, record_height_denoms: 0}
                        denomAllInfo.record_height = latestOneNftDenom?.height
                        denomAllInfo.record_height_denoms = await this.denomModel.queryDenomCountWithHeight(latestOneNftDenom?.height)
                        statisticsRecord.statistics_info = JSON.stringify(denomAllInfo)
                    }
                    statisticsRecord.count = await this.denomModel.queryAllCount();
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
    async queryAccounts(): Promise<number>{
        const data = await globalAccountNumber()
        return data?.globalAccountNumber || 0
    }

}