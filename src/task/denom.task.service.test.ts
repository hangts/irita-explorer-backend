import { DenomTaskService } from './denom.task.service';
import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';

describe('DenomTaskService', () => {
  let denomTaskService: DenomTaskService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports:[
        AppModule
      ]
    }).compile();
    denomTaskService = module.get<DenomTaskService>(DenomTaskService);
  });

  describe('DenomTaskService doTask', () => {
    it('doTask', async () => {
      jest.setTimeout(1000000)
      denomTaskService.doTask();
    });

  });
});