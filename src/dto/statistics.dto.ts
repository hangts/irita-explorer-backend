export class StatisticsResDto {
    private blockHeight: number;
    private latestBlockTime:number;
    private txCount: number;
    private avgBlockTime: number;
    private serviceCount: number;
    private validatorCount: number;
    private assetCount: number;

    constructor(blockHeight: number, latestBlockTime:number, txCount: number, avgBlockTime: number, serviceCount: number, validatorCount: number, assetCount: number){
        this.blockHeight = blockHeight;
        this.latestBlockTime = latestBlockTime;
        this.txCount = txCount;
        this.avgBlockTime = avgBlockTime;
        this.serviceCount = serviceCount;
        this.validatorCount = validatorCount;
        this.assetCount = assetCount;
    }
}

