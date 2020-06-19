import { Test } from '@nestjs/testing';
import { DenomService } from './denom.service';
import { AppModule } from '../app.module';

describe('denom service', () => {
    let denomService: DenomService;

    beforeEach(async () => {
        const app = await Test.createTestingModule({
            imports:[AppModule],
        }).compile();

        denomService = app.get<DenomService>(DenomService);

    });

    describe('test denom', () => {
        it('should return the same result', async () => {
            const data = await denomService.queryList();
            expect(data).toBeDefined();
        });
    });
});
