import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from "mongoose";
import { getTimestamp,BigNumberPlus } from '../util/util';
import { cfg } from "../config/config";
import { getTaskStatus } from '../helper/task.helper';
import { IRandomKey } from '../types';
import { TaskEnum } from '../constant';
import { IAccountStruct } from '../types/schemaTypes/account.interface';
import { StakingHttp } from "../http/lcd/staking.http";
import { DistributionHttp } from "../http/lcd/distribution.http";
import { moduleStaking,addressAccount } from "../constant";

@Injectable()
export class AccountInfoTaskService {
    constructor(
        @InjectModel('Tx') private txModel: any,
        @InjectModel('ParametersTask') private parametersTaskModel: Model<any>,
        @InjectModel('Account') private accountModel: any,
        private readonly stakingHttp: StakingHttp,
        private readonly distributionHttp: DistributionHttp,
    ) {
        this.doTask = this.doTask.bind(this);
    }
    async doTask(taskName?: TaskEnum, randomKey?: IRandomKey): Promise<void> {
        const accountList: IAccountStruct[] = await (this.accountModel as any).queryAllAddress();
        const stakingToken = await (this.parametersTaskModel as any).queryStakingToken(moduleStaking);
        if (accountList && accountList.length > 0) {
            for (const { address } of accountList) {
                if (address !== addressAccount) {
                    // 处理 balance
                    const balances = await this.stakingHttp.queryBalanceByAddress(address);
                    const balanceArray = (balances || []).filter(item => item.denom === stakingToken.cur_value)
                    const balancesAmount = balanceArray && balanceArray[0] && Number(balanceArray[0].amount) || 0;
                    // 处理 rewards
                    const rewardsFromLCD = await DistributionHttp.queryDelegatorRewards(address);
                    const rewards: any = rewardsFromLCD && rewardsFromLCD.total && rewardsFromLCD.total[0] || {};
                    // 处理 delegation
                    let delegationFlag:any = true;
                    let delegationsArray = [];
                    let delegationPageNum = 1;
                    while (delegationFlag) {
                        const delegationsFromLCD = await this.stakingHttp.queryDelegatorsDelegationsFromLcd(address, delegationPageNum);
                        delegationFlag = delegationsFromLCD && delegationsFromLCD.next_key;
                        if (delegationsFromLCD && delegationsFromLCD.result && delegationsFromLCD.result.length > 0) {
                            delegationsArray = delegationsArray.concat(delegationsFromLCD.result);
                        }
                        delegationPageNum++;
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
                    // 处理 unbonding_delegation 
                    let unbondingDelegationFlag:any = true;
                    let unbondingDelegationsArray = [];
                    let unbondingDelegationPageNum = 1;
                    while (unbondingDelegationFlag) {
                        const unbondingDelegationsFromLCD = await this.stakingHttp.queryDelegatorsUndelegationsFromLcd(address, unbondingDelegationPageNum);
                        unbondingDelegationFlag = unbondingDelegationsFromLCD && unbondingDelegationsFromLCD.next_key;
                        if (unbondingDelegationsFromLCD && unbondingDelegationsFromLCD.result && unbondingDelegationsFromLCD.result.length > 0) {
                            unbondingDelegationsArray = unbondingDelegationsArray.concat(unbondingDelegationsFromLCD.result);
                        }
                        unbondingDelegationPageNum++;
                    }
                    let unbondingDelegationAmount = 0;
                    (unbondingDelegationsArray || []).forEach(unbondingDelegation => {
                        if (unbondingDelegation.entries && unbondingDelegation.entries[0] && unbondingDelegation.entries[0].balance) {
                            unbondingDelegationAmount = BigNumberPlus(unbondingDelegationAmount, unbondingDelegation.entries[0].balance);
                        }
                    })
                    const unbonding_delegation  = {
                        denom: stakingToken.cur_value,
                        amount: unbondingDelegationAmount
                    };
                    let temp = 0; 
                    if (balancesAmount) {
                        temp = BigNumberPlus(temp,balancesAmount)
                    }
                    if (delegation.amount) {
                        temp = BigNumberPlus(temp, delegation.amount);
                    }
                    if (rewards.amount) {
                        temp = BigNumberPlus(temp, rewards.amount);
                    }
                    if (unbonding_delegation.amount) {
                        temp = BigNumberPlus(temp, unbonding_delegation.amount);
                    }
                    const account_total = temp;
                    const total = {
                        denom: stakingToken.cur_value,
                        amount: account_total
                    }
                    await (this.accountModel as any).updateAccount({
                        address,
                        account_total: account_total,
                        total: total,
                        balance: balances,
                        delegation: delegation,
                        unbonding_delegation: unbonding_delegation,
                        rewards: {
                            denom: rewards.denom || stakingToken.cur_value,
                            amount: Number(rewards.amount) || 0
                        },
                        update_time: getTimestamp(),
                    });
                }
            }
        }
    }
}
