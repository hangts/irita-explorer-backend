import { map, withLatestFrom } from 'rxjs/operators';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct } from '../api/ApiResult';
import {
    genesisAccountsReqDto,
} from '../dto/account.dto';
import {
    accountsListResDto,
    tokenStatsResDto,
    accountTotalResDto
} from '../dto/account.dto';
import { currentChain,moduleStaking,addressAccount } from '../constant';
import { json } from 'express';
import { BigNumberPlus, BigNumberDivision,BigNumberMinus,BigNumberMultiplied } from "../util/util";
import { BankHttp } from '../http/lcd/bank.http';
import { StakingHttp } from '../http/lcd/staking.http';
import { TokensHttp } from '../http/lcd/tokens.http';
import { DistributionHttp } from '../http/lcd/distribution.http';
import { cfg } from "../config/config"

const path = require('path');
const fs = require('fs')

@Injectable()
export class AccountService {
    constructor(
        @InjectModel('Account') private accountModel: any,
        @InjectModel('ParametersTask') private parametersTaskModel: Model<any>,
        @InjectModel('Tokens') private tokensModel: Model<any>,
        private readonly TokensHttp: TokensHttp,
        private readonly stakingHttp: StakingHttp) {}

    async taskGenesisAccounts(query: genesisAccountsReqDto): Promise<String> {
        try {
            const { chain } = query;
            let genesisPath: string;
            switch (chain) {
                case currentChain.iris:
                    genesisPath = path.join(__dirname, '../../public', 'genesis_irishub.json');
                    break;
                case currentChain.cosmos:
                    genesisPath = path.join(__dirname, '../../public', 'genesis_cosmos.json');
                    break;
                default:
                    break;
            }
            const genesisStr = fs.readFileSync(genesisPath).toString();
            const genesis = JSON.parse(genesisStr);
            const accounts = genesis && genesis.app_state && genesis.app_state.auth && genesis.app_state.auth.accounts;
            const supers = genesis && genesis.app_state && genesis.app_state.guardian && genesis.app_state.guardian.supers;
            let address = [];
            if (supers && supers.length > 0) {
                supers.forEach(item => {
                    item.address ? address.push({address: item.address}) : '';
                });
            }
            if (accounts && accounts.length > 0) {
                accounts.forEach(account => {
                    account.address ? address.push({address: account.address}) : '';
                });
            }
            if (address && address.length > 0) {
                await (this.accountModel as any).insertManyAccount(address);
                return `insert ${address.length}`
            }
            return `insert fail`
        } catch (e) {
            if (e.name == 'BulkWriteError') {
                return 'insert success'
            } else {
                throw e;
            }
        }
    }

    async getAccountsList(): Promise<accountsListResDto> {
        const accountList = await this.accountModel.queryAccountsLimit();
        let updated_time;
        let data = [];
        if (accountList && accountList.length > 0) {
            updated_time = accountList[0].update_time;
            let total = 0;
            accountList.forEach(account => {
                if (account.total && account.total.amount) {
                    total = BigNumberPlus(total,account.total.amount)
                }
            });
            data = accountList.filter(item => item.address !== addressAccount).map((account,index) => {
                let percent;
                let balance;
                if (account.total) {
                    percent = BigNumberDivision(account.total.amount, total)
                    balance = account.total
                }
                return {
                    rank: index + 1,
                    address: account.address,
                    balance,
                    percent
                }
            });
        }
        return {data,updated_time}
    }

    async getTokenStats(): Promise<tokenStatsResDto> {
        const [bondedTokensLcd, totalSupplyLcd, communityPoolFromLcd, stakingToken, mainToken] = await Promise.all([StakingHttp.getBondedTokens(), BankHttp.getTotalSupply(), DistributionHttp.getCommunityPool(), (this.parametersTaskModel as any).queryStakingToken(moduleStaking), (this.tokensModel as any).queryMainToken()]);
        const scale = mainToken && mainToken.scale;
        const bonded_tokens = {
            denom: stakingToken && stakingToken.cur_value,
            amount: bondedTokensLcd && bondedTokensLcd.bonded_tokens
        };
        const total_supply_tokens = (totalSupplyLcd && totalSupplyLcd.supply || []).filter(item => item.denom === (stakingToken && stakingToken.cur_value))[0] || { denom: '', amount: '' };
        const community_tax = communityPoolFromLcd && communityPoolFromLcd.pool && communityPoolFromLcd.pool[0] || {};
        let circulation_tokens;
        switch (cfg.currentChain) {
            case currentChain.iris:
                const circulation_amount = await this.TokensHttp.getCirculationtTokens()
                circulation_tokens = {
                    denom: stakingToken && stakingToken.cur_value,
                    amount: BigNumberMultiplied(circulation_amount,Math.pow(10,scale || 6))
                }
                break;
            case currentChain.cosmos:
                circulation_tokens = {
                    denom: stakingToken && stakingToken.cur_value,
                    amount: null
                }
                break;
            default:
                break;
        }
        return new tokenStatsResDto({bonded_tokens, total_supply_tokens,circulation_tokens,community_tax})
    }

    async getAccountTotal(): Promise<accountTotalResDto> {
        const tokenFromDB = await this.accountModel.queryTokenTotal();
        const tokens = tokenFromDB && tokenFromDB.account_totals;
        const stakingToken = await (this.parametersTaskModel as any).queryStakingToken(moduleStaking);
        const accountList = await this.accountModel.queryAccountsTotalLimit();
        if (accountList && accountList.length > 0) {
            const first = this.addAmount(accountList.splice(0, 5),tokens,stakingToken.cur_value);
            const second = this.addAmount(accountList.splice(0, 5),tokens,stakingToken.cur_value);
            const third = this.addAmount(accountList.splice(0, 40),tokens,stakingToken.cur_value);
            const fourth = this.addAmount(accountList.splice(0, 50),tokens,stakingToken.cur_value);
            const fifth = this.addAmount(accountList.splice(0, 400),tokens,stakingToken.cur_value);
            const sixth = this.addAmount(accountList.splice(0, 500), tokens, stakingToken.cur_value);
            let firstSixth = 0;
            firstSixth = BigNumberPlus(firstSixth, first.total);
            firstSixth = BigNumberPlus(firstSixth, second.total);
            firstSixth = BigNumberPlus(firstSixth, third.total);
            firstSixth = BigNumberPlus(firstSixth, fourth.total);
            firstSixth = BigNumberPlus(firstSixth, fifth.total);
            firstSixth = BigNumberPlus(firstSixth, sixth.total);
            const lastAmount = BigNumberMinus(tokens, firstSixth) > 0 ? BigNumberMinus(tokens, firstSixth) : 0;
            const lastPercent = BigNumberDivision(lastAmount, tokens);
            const last = {
                total_amount: {
                    denom: stakingToken.cur_value,
                    amount: lastAmount
                },
                percent: lastPercent
            }
            return new accountTotalResDto({
                "1-5": first,
                "6-10": second,
                "11-50": third,
                "51-100": fourth,
                "101-500": fifth,
                "501-1000": sixth,
                "1001-": last
            })
        }
        return new accountTotalResDto({
            "1-5": {},
            "6-10": {},
            "11-50": {},
            "51-100": {},
            "101-500": {},
            "501-1000": {},
            "1001-": {}
        })
    }
    addAmount(array,totals,denom) {
        let total = 0;
        (array || []).forEach(item => {
            if (item.total && item.total.amount) {
                total = BigNumberPlus(total,item.total.amount)
            }
        });
        const percent = BigNumberDivision(total, totals)
        return {
            total_amount: {
                denom,
                amount: total
            },
            percent,
            total,
        }
    }
}
