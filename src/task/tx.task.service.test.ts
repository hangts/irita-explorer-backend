import { Test } from '@nestjs/testing';
import {TxTaskService} from './tx.task.service';
import { AppModule } from './../app.module';
        
describe('TxTaskService', () => {
    let txTaskService: TxTaskService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports:[
                AppModule
            ]
          }).compile();
        txTaskService = module.get<TxTaskService>(TxTaskService);
    });

    describe('syncRespondServiceTxServiceName', () => {
        it('sync respond service tx service name', async () => {
            txTaskService.doTask();
        });
    });
});

