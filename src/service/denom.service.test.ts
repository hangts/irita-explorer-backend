import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { ListStruct } from '../api/ApiResult';
import { DenomService } from './denom.service';
import { DenomListResDto } from '../dto/denom.dto';


describe('denom module', () => {
    let denomService: DenomService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports:[
                AppModule
            ]
        }).compile();
        denomService = module.get<DenomService>(DenomService);
    });

    describe('queryList', () => {
        it('should return denom list', async () => {
            const data: ListStruct<DenomListResDto[]> = await denomService.queryList();
            expect(data).toBeDefined();
        });
    });

    describe('async', () => {
        it('should return true', async () => {
            const data: boolean = await denomService.doTask();
            expect(data).toBe(true);
        });
    });


});

