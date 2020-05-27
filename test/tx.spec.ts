import { Test } from '@nestjs/testing';
import { TxService } from '../src/service/tx.service';
import {TxController} from '../src/controller/tx.controller';
import {TxModule} from '../src/middleware/tx.module';

describe('AppController', () => {
  let txService: TxService;
  let txController: TxController;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      imports:[TxModule],
      providers: [TxService],
      controllers:[TxController],
    }).compile();

    txService = app.get<TxService>(TxService);
    txController = app.get<TxController>(TxController);

  });

  describe('test tx', () => {
    let o = {
      data:[{
        name:'lsc',
        age:18
      }],
      pageNumber:1,
      pageSize:10,
      count:10,
    };

    it('should return the same result', () => {
      expect(txService.getListResult([{name:'lsc',age:18}], 1, 10, 10)).toBe(o);
    });
  });
});
