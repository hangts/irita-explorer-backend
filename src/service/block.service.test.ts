import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { BlockService } from './block.service';
import { BlockListReqDto, BlockListResDto } from '../dto/block.dto';
import { ListStruct } from '../api/ApiResult';


describe('block.service', () => {
    let blockService: BlockService;
    this.timeout(10000);
    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                AppModule,
            ],
        }).compile();
        blockService = module.get<BlockService>(BlockService);
    });

    describe('queryBlockList', () => {
        it('should return block list', async () => {
            let req: BlockListReqDto = {
                pageNum: 1,
                pageSize: 10,
                useCount: true,
            };

            const data: ListStruct<BlockListResDto[]> = await blockService.queryBlockList(req);
            expect(data).toBeDefined();
        });
    });
});

