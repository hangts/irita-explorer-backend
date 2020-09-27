export class StatisticsResDto {
    private blockHeight: number;
    private latestBlockTime:number;
    private txCount: number;
    private avgBlockTime: number;
    private serviceCount: number;
    private validatorCount: number;
    private assetCount: number;
    private identityCount: number;

    constructor(
        blockHeight: number, 
        latestBlockTime:number, 
        txCount: number, 
        avgBlockTime: number, 
        serviceCount: number, 
        validatorCount: number, 
        assetCount: number,
        identityCount: number){

        this.blockHeight = blockHeight;
        this.latestBlockTime = latestBlockTime;
        this.txCount = txCount;
        this.avgBlockTime = avgBlockTime;
        this.serviceCount = serviceCount;
        this.validatorCount = validatorCount;
        this.assetCount = assetCount;
        this.identityCount = identityCount;
    }
}

