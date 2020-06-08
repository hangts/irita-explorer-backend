import { IsString, IsInt,  } from 'class-validator';

export class DenomDto {

}

export class StatisticsResDto {
    private blockHeight: number;
    private txCount: number;
    private avgBlockTime: number;
    private serviceCount: number;
    private validatorCount: number;
    private assetCount: number;

    constructor(blockHeight: number, txCount: number, avgBlockTime: number, serviceCount: number, validatorCount: number, assetCount: number){
        this.blockHeight = blockHeight;
        this.txCount = txCount;
        this.avgBlockTime = avgBlockTime;
        this.serviceCount = serviceCount;
        this.validatorCount = validatorCount;
        this.assetCount = assetCount;
    }
}

