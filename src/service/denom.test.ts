import { Test } from '@nestjs/testing';
import { DenomService } from './denom.service';
import {DenomController} from '../controller/denom.controller';
import {DenomModule} from '../module/denom.module';

describe('AppController', () => {
    let denomService: DenomService;
    let denomController: DenomController;

    beforeEach(async () => {
        const app = await Test.createTestingModule({
            imports:[DenomModule],
            providers: [DenomService],
            controllers:[DenomController],
        }).compile();

        denomService = app.get<DenomService>(DenomService);
        denomController = app.get<DenomController>(DenomController);

    });

    describe('test denom', () => {
        let o = {
            data:[{
                name:'lsc',
                age:18
            }],
            pageNum:1,
            pageSize:10,
            count:10,
        };

        it('should return the same result', async () => {
            //expect(denomService.queryList().toBe(o);
        });
    });
});
