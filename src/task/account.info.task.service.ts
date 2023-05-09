import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from "mongoose";
import { getTimestamp,BigNumberPlus } from '../util/util';
import { cfg } from "../config/config";
import { getTaskStatus } from '../helper/task.helper';
import { IRandomKey } from '../types';
import { TaskEnum } from '../constant';
import { IAccountStruct,CommissionReward } from '../types/schemaTypes/account.interface';
import { StakingHttp } from "../http/lcd/staking.http";
import { DistributionHttp } from "../http/lcd/distribution.http";
import { moduleStaking,addressAccount } from "../constant";
import {addressTransform} from "../util/util";
import {CronTaskWorkingStatusMetric} from "../monitor/metrics/cron_task_working_status.metric";

@Injectable()
export class AccountInfoTaskService {
    constructor(
        @InjectModel('Tx') private txModel: any,
        @InjectModel('ParametersTask') private parametersTaskModel: Model<any>,
        @InjectModel('Account') private accountModel: any,
        @InjectModel('StakingSyncValidators') private stakingSyncValidatorsModel: Model<any>,
        private readonly stakingHttp: StakingHttp,
        private readonly distributionHttp: DistributionHttp,
        private readonly cronTaskWorkingStatusMetric: CronTaskWorkingStatusMetric,
    ) {
        this.doTask = this.doTask.bind(this);
        this.cronTaskWorkingStatusMetric.collect(TaskEnum.accountInfo,0);
    }
    async doTask(taskName?: TaskEnum, randomKey?: IRandomKey): Promise<void> {
        const accountList: IAccountStruct[] = await (this.accountModel as any).queryAllAddress();
        const validatorsFromDb = await (this.stakingSyncValidatorsModel as any).queryAllValidators();
        let ivaArray = [];
        if (validatorsFromDb && validatorsFromDb.length > 0) {
            validatorsFromDb.forEach(iva => {
                ivaArray.push(iva.operator_address)
            })
        }
        const stakingToken = await (this.parametersTaskModel as any).queryStakingToken(moduleStaking);
        if (accountList && accountList.length > 0) {
            for (let { address } of accountList) {
                if (address !== addressAccount) {
                    // balance and rewards
                    let balances, delegatorRewards, commissionRewards;
                    const ivaAddress = addressTransform(address, cfg.addressPrefix.iva);
                    if (ivaArray.includes(ivaAddress)) {
                        [balances,delegatorRewards,commissionRewards] = await Promise.all([this.stakingHttp.queryBalanceByAddress(address),DistributionHttp.queryDelegatorRewards(address),DistributionHttp.getCommissionRewards(ivaAddress)]);
                        if(!balances || !delegatorRewards || !commissionRewards) continue;
                    } else {
                        [balances,delegatorRewards] = await Promise.all([this.stakingHttp.queryBalanceByAddress(address),DistributionHttp.queryDelegatorRewards(address)]);
                        if(!balances || !delegatorRewards) continue;
                    }
                    const balanceArray = (balances || []).filter(item => item.denom === stakingToken.cur_value)
                    const balancesAmount = balanceArray && balanceArray[0] && balanceArray[0].amount || 0;
                    const delegatorReward = delegatorRewards && delegatorRewards.total && delegatorRewards.total[0] || { denom: '', amount: '' };
                    const commissionReward = commissionRewards && commissionRewards.val_commission && (commissionRewards.val_commission as any).commission && (commissionRewards.val_commission as any).commission.length > 0 && (commissionRewards.val_commission as any).commission[0] || { denom: '', amount: '' };
                    const rewards = {
                        denom: stakingToken.cur_value,
                        amount: Math.floor(BigNumberPlus(delegatorReward.amount || 0, commissionReward.amount || 0)) || ''
                    };
                    // delegation and unbonding_delegation
                    let delegationFlag:any = true;
                    let delegationsArray = [];
                    let delegationPageNum = 1;
                    let unbondingDelegationFlag:any = true;
                    let unbondingDelegationsArray = [];
                    let unbondingDelegationPageNum = 1;
                    while (delegationFlag || unbondingDelegationFlag) {
                        if (delegationFlag && unbondingDelegationFlag) {
                            const [delegationsFromLCD, unbondingDelegationsFromLCD] = await Promise.all([this.stakingHttp.queryDelegatorsDelegationsFromLcd(address, delegationPageNum), this.stakingHttp.queryDelegatorsUndelegationsFromLcd(address, unbondingDelegationPageNum)]);
                            [delegationFlag, delegationsArray] = this.handleDelegationAndUnbondingDelegations(delegationsArray, delegationsFromLCD);
                            [unbondingDelegationFlag, unbondingDelegationsArray] = this.handleDelegationAndUnbondingDelegations(unbondingDelegationsArray, unbondingDelegationsFromLCD);
                            delegationPageNum++;
                            unbondingDelegationPageNum++;
                        } else if (delegationFlag) {
                            const delegationsFromLCD = await this.stakingHttp.queryDelegatorsDelegationsFromLcd(address, delegationPageNum);
                            [delegationFlag, delegationsArray] = this.handleDelegationAndUnbondingDelegations(delegationsArray, delegationsFromLCD);
                            delegationPageNum++;
                        }else if (unbondingDelegationFlag) {
                            const unbondingDelegationsFromLCD = await this.stakingHttp.queryDelegatorsUndelegationsFromLcd(address, unbondingDelegationPageNum);
                            [unbondingDelegationFlag, unbondingDelegationsArray] = this.handleDelegationAndUnbondingDelegations(unbondingDelegationsArray, unbondingDelegationsFromLCD);
                            unbondingDelegationPageNum++;
                        }
                    }
                    let delegationAmount = 0;
                    (delegationsArray || []).forEach(delegation => {
                        if (delegation.balance && delegation.balance.amount) {
                            delegationAmount = BigNumberPlus(delegationAmount, delegation.balance.amount)
                        }
                    })
                    const delegation = {
                        denom: stakingToken.cur_value,
                        amount: delegationAmount
                    };
                    let unbondingDelegationAmount = 0;
                    (unbondingDelegationsArray || []).forEach(unbondingDelegation => {
                        if (unbondingDelegation.entries && unbondingDelegation.entries.length>0) {
                            for (const one of unbondingDelegation.entries) {
                                if (one?.balance) {
                                    unbondingDelegationAmount = BigNumberPlus(unbondingDelegationAmount, one.balance);
                                }
                            }
                        }

                    })
                    const unbonding_delegation  = {
                        denom: stakingToken.cur_value,
                        amount: unbondingDelegationAmount
                    };
                    let temp = 0; 
                    if (balancesAmount) temp = BigNumberPlus(temp, balancesAmount);
                    if (delegation.amount) temp = BigNumberPlus(temp, delegation.amount);
                    if (rewards.amount) temp = BigNumberPlus(temp, rewards.amount);
                    if (unbonding_delegation.amount) temp = BigNumberPlus(temp, unbonding_delegation.amount);
                    const account_total = temp;
                    const total = {
                        denom: stakingToken.cur_value,
                        amount: account_total
                    };
                    await (this.accountModel as any).updateAccount({
                        address,
                        account_total: account_total,
                        total: total,
                        balance: balances,
                        delegation: delegation,
                        unbonding_delegation: unbonding_delegation,
                        rewards,
                        update_time: getTimestamp(),
                    });
                }
            }
        }
        this.cronTaskWorkingStatusMetric.collect(TaskEnum.accountInfo,1);
    }
    handleDelegationAndUnbondingDelegations(dataArray,dataFromLCD) {
        let flag = dataFromLCD && dataFromLCD.next_key;
        if (dataFromLCD && dataFromLCD.result && dataFromLCD.result.length > 0) {
            dataArray = dataArray.concat(dataFromLCD.result);
        }
        return [flag, dataArray]
    }
}
