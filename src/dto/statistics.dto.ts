export class StatisticsResDto {
    private blockHeight: number;
    private latestBlockTime:number;
    private txCount: number;
    private avgBlockTime: number;
    private serviceCount: number;
    private validatorCount: number;
    private assetCount: number;
    private identityCount: number;
    private denomCount: number;
    private validatorNumCount: number;
    private moniker: string;
    private validator_icon: string;
    private bonded_tokens: string;
    private total_supply: string;

    constructor(
        blockHeight: number, 
        latestBlockTime:number, 
        txCount: number, 
        avgBlockTime: number, 
        serviceCount: number, 
        validatorCount: number, 
        assetCount: number,
        identityCount: number,
        denomCount: number,
        validatorNumCount: number,
        moniker: string,
        validator_icon: string,
        bonded_tokens: string,
        total_supply: string,
    ) {

        this.blockHeight = blockHeight;
        this.latestBlockTime = latestBlockTime;
        this.txCount = txCount;
        this.avgBlockTime = avgBlockTime;
        this.serviceCount = serviceCount;
        this.validatorCount = validatorCount;
        this.assetCount = assetCount;
        this.identityCount = identityCount;
        this.denomCount = denomCount;
        this.validatorNumCount = validatorNumCount;
        this.moniker = moniker;
        this.validator_icon = validator_icon;
        this.bonded_tokens = bonded_tokens;
        this.total_supply = total_supply;
    }
}

