import { StatisticsTaskService } from './statistics.task.service';
import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';


describe('StatisticsTaskService', () => {
  let statisticsTaskService: StatisticsTaskService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports:[
        AppModule
      ]
    }).compile();
    statisticsTaskService = module.get<StatisticsTaskService>(StatisticsTaskService);
  });

  describe('StatisticsTaskService doTask', () => {
    it('doTask', async () => {
      statisticsTaskService.doTask();
    });

    it('queryAssetCount', async () => {
      const count = await statisticsTaskService.queryAssetCount();
      console.log("=====>AssetCount:",count)
    });

    it('queryTxCount', async () => {
      const count = await statisticsTaskService.queryTxCount();
      console.log("=====>queryTxCount:",count)
    });

    it('queryServiceCount', async () => {
      const count = await statisticsTaskService.queryServiceCount();
      console.log("=====>ServiceCount:",count)
    });

    it('queryIdentityCount', async () => {
      const count = await statisticsTaskService.queryIdentityCount();
      console.log("=====>IdentityCount:",count)
    });

    it('queryDenomCount', async () => {
      const count = await statisticsTaskService.queryDenomCount();
      console.log("=====>DenomCount:",count)
    });

    it('queryValidatorNumCount', async () => {
      const count = await statisticsTaskService.queryValidatorNumCount();
      console.log("=====>ValidatorNumCount:",count)
    });

    it('queryCommunityPool', async () => {
      const pool = await statisticsTaskService.queryCommunityPool();
      console.log("=====>queryCommunityPoolInformation:",pool)
    });
  });
});