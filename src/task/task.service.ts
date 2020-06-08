import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DenomService } from '../service/denom.service';
import { NftService } from '../service/nft.service';


@Injectable()
export class TasksService {
    private readonly logger = new Logger('from task service');


    constructor(private readonly denomService: DenomService, private readonly nftService: NftService) {
    }

    @Cron('30 * * * * *')
    handleCron() {
        this.logger.log('cron jobs is running!');
    }

    @Cron('40 * * * * *')
    syncDenoms() {
        this.logger.log('cron jobs of denoms async is running!');
        this.denomService.async();
    }

    @Cron('45 * * * * *')
    syncNfts() {
        this.logger.log('cron jobs of nft async is running!');
        this.nftService.findDenomAndSyncNft();
    }






}