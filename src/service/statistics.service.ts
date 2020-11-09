import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { StatisticsResDto } from '../dto/statistics.dto';
import { IBlock, IBlockStruct } from '../types/schemaTypes/block.interface';
import { INft } from '../types/schemaTypes/nft.interface';
import { BlockHttp } from '../http/lcd/block.http';
import { StatisticsHttp } from '../http/lcd/statistics.http';

@Injectable()
export class StatisticsService {

    constructor(
        @InjectModel('Block') private blockModel: Model<IBlock>,
        @InjectModel('Nft') private nftModel: Model<INft>,
        @InjectModel('Tx') private txModel: any,
        @InjectModel('Validators') private validatorModel: any,
        @InjectModel('Identity') private identityModel: any,
        @InjectModel('Denom') private denomModel: any,
        @InjectModel('StakingSyncValidators') private stakingValidatorsModel: any,
        @InjectModel('Tokens') private tokensModel: Model<any>,
    ) {
    }

    async queryStatistics(): Promise<StatisticsResDto> {
        const latestBlock = await BlockHttp.queryLatestBlockFromLcd();
        const block = await this.queryLatestHeightAndTime(latestBlock);
        const avgBlockTime = await this.queryAvgBlockTime();
        const assetCount = await this.queryAssetCount();
        const validatorCount = await this.queryConsensusValidatorCount();
        const {txCount, serviceCount} = await this.queryTxCount();
        const identityCount = await this.queryIdentityCount({});
        const denomCount = await this.queryDenomCount();
        const validatorNumCount = await this.queryValidatorNumCount();
        let proposer_address = latestBlock && latestBlock.block && latestBlock.block.header && latestBlock.block.header.proposer_address
        const validatorInformation = await this.queryValidatorInformation(proposer_address);
        const bondedTokensInformation = await this.queryBondedTokensInformation()
        return new StatisticsResDto(block.height, block.latestBlockTime, txCount, avgBlockTime, serviceCount, validatorCount, assetCount, identityCount, denomCount,validatorNumCount,validatorInformation.moniker,validatorInformation.validator_icon,validatorInformation.operator_addr,bondedTokensInformation.bonded_tokens,bondedTokensInformation.total_supply);
    }

    async queryLatestHeightAndTime(latestBlock?:any): Promise<{height:number,latestBlockTime:number} | null> {
        let result:any = { height:0,latestBlockTime:0 };
        if (latestBlock && latestBlock.block && latestBlock.block.header) {
            result.height = latestBlock.block.header.height;
            result.latestBlockTime = new Date(latestBlock.block.header.time || '').getTime()/1000;
        }else {
            const res: IBlockStruct | null = await (this.blockModel as any).findOneByHeightDesc();
            if (res) {
                result.height = res.height;
                result.latestBlockTime = Number(res.time);
            }
        }
        return result;
    }

    async queryAvgBlockTime(): Promise<number | null> {
        const latestBlock: IBlockStruct | null = await (this.blockModel as any).findOneByHeightDesc();
        const num100Block: IBlockStruct | null = await (this.blockModel as any).findNum100Height();
        if (latestBlock && num100Block) {
            const latestTime = Number(new Date(latestBlock.time).getTime());
            const num100Time = Number(new Date(num100Block.time).getTime());
            let avgTime: number;
            if (latestBlock.height - num100Block.height >= 100) {
                avgTime = (latestTime - num100Time) / 100;
            } else {
                //可能当前区块高度还不到100
                const diff: number = latestBlock.height - num100Block.height;
                if(diff){
                    avgTime = (latestTime - num100Time) / diff;
                }else{
                    return null;
                }
            }
            return !isNaN(avgTime) ? Number(avgTime.toFixed(2)) : null;
        } else {
            return null;
        }
    }

    async queryAssetCount(): Promise<number | null>{
        return await (this.nftModel as any).findCount();
    }

    async queryConsensusValidatorCount(): Promise<number | null>{
        return await (this.validatorModel as any).findCount(false);
    }

    async queryTxCount():Promise<any>{
        return await (this.txModel as any).queryTxStatistics();
    }

    async queryIdentityCount(query:any):Promise<any>{
        return await this.identityModel.queryIdentityCount(query);
    }

    async queryDenomCount():Promise<any>{
        return await this.denomModel.queryAllCount();
    }

    async queryValidatorNumCount():Promise<any>{
        return await this.stakingValidatorsModel.queryActiveValCount();
    }
    
    async queryValidatorInformation(proposer): Promise<any>{
        let validators = await this.stakingValidatorsModel.queryAllValidators();
        validators = validators.filter(item => {
            return item.proposer_addr === proposer
        })
        const moniker = (validators && validators[0] && validators[0].description && validators[0].description.moniker) || '';
        const validator_icon = (validators && validators[0] && validators[0].icon) || '';
        const operator_addr = (validators && validators[0] && validators[0].operator_address) || '';
        return { moniker, validator_icon,operator_addr };
    }

    async queryBondedTokensInformation(): Promise<any>{
        const bondedTokensLcd = await StatisticsHttp.getBondedTokens()
        const totalSupplyLcd = await StatisticsHttp.getTotalSupply()
        const bonded_tokens = bondedTokensLcd && bondedTokensLcd.bonded_tokens || '0'
        const mainToken = await (this.tokensModel as any).queryMainToken()
        let total_supply: string = '0';
        if (totalSupplyLcd && totalSupplyLcd.supply && totalSupplyLcd.supply.length > 0) {
            totalSupplyLcd.supply.map(item => {
                if (item.denom === mainToken.min_unit) {
                    total_supply = item.amount
                }
            })
        }
        return { bonded_tokens, total_supply };
    }
}
