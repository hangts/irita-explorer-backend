import { Test } from '@nestjs/testing';
import { DistributionController } from '../controller/distribution.controller';
import { DistributionService } from './distribution.service';
import { AppModule } from './../app.module';
import { Logger } from '../logger';
import { 
  WithdrawAddressReqDto,
  DelegatorRewardsReqDto } from "../dto/distribution.dto"
import { 
  WithdrawAddressResDto,
  DelegatorRewardsResDto } from "../dto/distribution.dto"
import {ListStruct} from "../api/ApiResult";

describe('DistributionController', () => {
    let distributionController: DistributionController;
    let distributionService: DistributionService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports:[
                AppModule
            ]
          }).compile();
        distributionService = module.get<DistributionService>(DistributionService);
        distributionController = module.get<DistributionController>(DistributionController);
    });

    describe('queryDelegatorWithdrawAddress', () => {
        it('should return an string of Withdraw Address', async () => {
            let req:WithdrawAddressReqDto = { delegatorAddr:'iaa1nfgkyn6ux5mvavhyk5aq8zgzushrecut267w7q' };
            let data:any = await distributionService.queryWithdrawAddress(req);
            expect(data.address).toBe('iaa1nfgkyn6ux5mvavhyk5aq8zgzushrecut267w7q');
        });
    });

    // describe('queryDelegatorRewards', () => {
    //     it('should return Delegator Rewards', async () => {
    //         let req:DelegatorRewardsReqDto = { delegatorAddr:'iaa1nfgkyn6ux5mvavhyk5aq8zgzushrecut267w7q' };
    //         let data:any = await distributionService.queryDelegatorRewards(req);
    //         expect(data).toBeDefined();
    //     });
    // });

});

