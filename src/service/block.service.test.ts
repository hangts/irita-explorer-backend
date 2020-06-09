import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { BlockService } from './block.service';
import { BlockDetailReqDto, BlockListReqDto, BlockListResDto } from '../dto/block.dto';
import { ListStruct } from '../api/ApiResult';


describe('service module', () => {
    let blockService: BlockService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports:[
                AppModule
            ]
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

    describe('queryBlockDetail', () => {
        it('should return block detail', async () => {
            let req: BlockDetailReqDto = {
                height: 10000,
            };

            const data: BlockListResDto | null = await blockService.queryBlockDetail(req);
            expect(data).toBeDefined();
        });
    });

    describe('queryLatestBlock', () => {
        it('should return a block detail', async () => {
            const data: any = await blockService.queryLatestBlock();
            expect(data).toBeDefined();
        });
    });

});

