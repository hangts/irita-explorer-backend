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
    private operator_addr: string;
    
    constructor(Detail) {
        this.blockHeight = Detail.block.height;
        this.moniker = Detail.block.moniker;
        this.validator_icon = Detail.block.validator_icon;
        this.operator_addr = Detail.block.operator_addr;
        this.latestBlockTime = Detail.block.latestBlockTime;
        this.txCount = Detail.txCount;
        this.avgBlockTime = Detail.avgBlockTime;
        this.serviceCount = Detail.serviceCount;
        this.validatorCount = Detail.validatorCount;
        this.assetCount = Detail.assetCount;
        this.identityCount = Detail.identityCount;
        this.denomCount = Detail.denomCount;
        this.validatorNumCount = Detail.validatorNumCount;
        
    }
}

export class PledgeRateResDto {
    bonded_tokens: string;
    total_supply: string;
    constructor(Detail) {
        this.bonded_tokens = Detail.bonded_tokens || '0'
        this.total_supply = Detail.total_supply || '0'
    }
}

export class LatestHeightAndTimeAndValidator {
    height: number;
    latestBlockTime: number;
    moniker: string;
    validator_icon: string;
    operator_addr: string;

    constructor(Detail) {
        this.height = Detail.height || 0
        this.latestBlockTime = Detail.latestBlockTime || 0
        this.moniker = Detail.moniker || ''
        this.validator_icon = Detail.validator_icon || ''
        this.operator_addr = Detail.operator_addr || ''
    }
}