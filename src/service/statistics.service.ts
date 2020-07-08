import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { StatisticsResDto } from '../dto/statistics.dto';
import { IBlock, IBlockStruct } from '../types/schemaTypes/block.interface';
import { INft } from '../types/schemaTypes/nft.interface';

@Injectable()
export class StatisticsService {

    constructor(
        @InjectModel('Block') private blockModel: Model<IBlock>,
        @InjectModel('Nft') private nftModel: Model<INft>,
        @InjectModel('Tx') private txModel: any,
        @InjectModel('Validators') private validatorModel: any
    ) {
    }

    async queryStatistics(): Promise<StatisticsResDto> {
        const block = await this.queryLatestHeightAndTime();
        const avgBlockTime = await this.queryAvgBlockTime();
        const assetCount = await this.queryAssetCount();
        const validatorCount = await this.queryConsensusValidatorCount();
        const {txCount, serviceCount} = await this.queryTxCount();

        return new StatisticsResDto(block.height, block.latestBlockTime, txCount, avgBlockTime, serviceCount, validatorCount, assetCount);
    }

    async queryLatestHeightAndTime(): Promise<{height:number,latestBlockTime:number} | null> {
        const res: IBlockStruct | null = await (this.blockModel as any).findOneByHeightDesc();
        if (res) {
            return {height:res.height, latestBlockTime:Number(res.time)};
        } else {
            return null;
        }
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
            return Math.floor(avgTime);
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


}

