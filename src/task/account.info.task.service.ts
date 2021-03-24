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
import { addressPrefix } from "../constant";

@Injectable()
export class AccountInfoTaskService {
    constructor(
        @InjectModel('Tx') private txModel: any,
        @InjectModel('ParametersTask') private parametersTaskModel: Model<any>,
        @InjectModel('Account') private accountModel: any,
        @InjectModel('StakingSyncValidators') private stakingSyncValidatorsModel: Model<any>,
        private readonly stakingHttp: StakingHttp,
        private readonly distributionHttp: DistributionHttp,
    ) {
        this.doTask = this.doTask.bind(this);
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
                    // 处理 balance
                    const balances = await this.stakingHttp.queryBalanceByAddress(address);
                    const balanceArray = (balances || []).filter(item => item.denom === stakingToken.cur_value)
                    const balancesAmount = balanceArray && balanceArray[0] && balanceArray[0].amount || 0;
                    // 处理 rewards
                    const ivaAddress = addressTransform(address, addressPrefix.iva);
                    let delegatorRewards, commissionRewards;
                    if (ivaArray.includes(ivaAddress)) {
                        [delegatorRewards,commissionRewards] = await Promise.all([DistributionHttp.queryDelegatorRewards(address),DistributionHttp.getCommissionRewards(ivaAddress)]);
                    } else {
                        delegatorRewards = await DistributionHttp.queryDelegatorRewards(address)
                    }
                    const delegatorReward = delegatorRewards && delegatorRewards.total && delegatorRewards.total[0] || { denom: '', amount: '' };
                    const commissionReward = commissionRewards && commissionRewards.val_commission && (commissionRewards.val_commission as any).commission && (commissionRewards.val_commission as any).commission.length > 0 && (commissionRewards.val_commission as any).commission[0] || { denom: '', amount: '' };
                    const rewards = {
                        denom: stakingToken.cur_value,
                        amount: BigNumberPlus(delegatorReward.amount || 0, commissionReward.amount || 0) || ''
                    };
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
                        rewards,
                        update_time: getTimestamp(),
                    });
                }
            }
        }
    }
}
