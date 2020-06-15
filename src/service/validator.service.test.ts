import { Test } from '@nestjs/testing';
import { ValidatorsController } from '../controller/validators.controller';
import { ValidatorsService } from './validator.service';
import { AppModule } from '../app.module';
import { ValidatorsReqDto , ValidatorsResDto} from '../dto/validators.dto';
import { ListStruct } from '../api/ApiResult';

describe('ValidatorsController',() => {
  let validatorsService : ValidatorsService;
  beforeEach( async () => {
    const module = await Test.createTestingModule({
      imports:[
        AppModule
      ]
    }).compile();
    validatorsService = module.get<ValidatorsService>(ValidatorsService);
  })
  describe('queryValidators', () => {
    it('should return validator list', async () => {
      let req: ValidatorsReqDto = {
        pageNum: 1,
        pageSize: 100,
        jailed : true,
        useCount: true,
      };

      const data: ListStruct<ValidatorsResDto[]> = await validatorsService.queryValidators(req);
      expect(data).toBeDefined();
    });
  });
})
