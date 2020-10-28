import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { StatisticsResDto } from '../dto/statistics.dto';
import { IBlock, IBlockStruct } from '../types/schemaTypes/block.interface';
import { INft } from '../types/schemaTypes/nft.interface';
import { BlockHttp } from '../http/lcd/block.http';

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
        return new StatisticsResDto(block.height, block.latestBlockTime, txCount, avgBlockTime, serviceCount, validatorCount, assetCount, identityCount, denomCount,validatorNumCount);
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
    

}

