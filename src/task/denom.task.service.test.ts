import { DenomTaskService } from './denom.task.service';
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
      denomTaskService.doTask();
    });

  });
});