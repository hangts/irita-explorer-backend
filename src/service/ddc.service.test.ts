import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { ListStruct } from '../api/ApiResult';
import { DdcService } from './ddc.service';
import { DdcListResDto,DdcDetailResDto } from '../dto/ddc.dto';


describe('ddc module', () => {
  let ddcService: DdcService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports:[
        AppModule
      ]
    }).compile();
    ddcService = module.get<DdcService>(DdcService);
  });

  describe('queryList', () => {
    it('should return ddc list', async () => {
      const data: ListStruct<DdcListResDto[]> = await ddcService.queryList({
        pageSize:4,pageNum:1,useCount:true,ddc_id:"1809"});
      expect(data).toBeDefined();
      console.log(data)
    });

    it('should return ddc detail', async () => {
      const data: DdcDetailResDto = await ddcService.queryDetail({contract_address:"0x74b6114d011891Ac21FD1d586bc7F3407c63c216",ddc_id:"1828"});
      expect(data).toBeDefined();
      console.log(data)
    });
  });

});

