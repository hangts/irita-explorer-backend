import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct } from '../api/ApiResult';
import {
    genesisAccountsReqDto
} from '../dto/account.dto';
import {

} from '../dto/account.dto';
import { currentChain } from '../constant';
// import {  } from "../util/util";
const path = require('path');
const fs = require('fs')

@Injectable()
export class AccountService {
    constructor(
        @InjectModel('Account') private accountModel: any,) { }

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

    
}
