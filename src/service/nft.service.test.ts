import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { ListStruct } from '../api/ApiResult';
import { NftService } from './nft.service';
import { NftDetailReqDto, NftDetailResDto, NftListReqDto, NftListResDto } from '../dto/nft.dto';
import { INftStruct } from '../types/schemaTypes/nft.interface';


describe('nft module', () => {
    let nftService: NftService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                AppModule,
            ],
        }).compile();
        nftService = module.get<NftService>(NftService);
    });

    describe('queryList', () => {
        it('should return nft list', async () => {
            const req: NftListReqDto = {
                pageNum: 1,
                pageSize: 10,
                useCount: true,
            };

            const data: ListStruct<NftListResDto[]> = await nftService.queryList(req);
            expect(data).toBeDefined();
        });
    });

    describe('queryDetail', () => {
        it('should return nft detail', async () => {
            const q: NftDetailReqDto = {
                denomId: 'sunshine',
                nftId: 'xiaobai1',
            };

            const data: NftDetailResDto | null = await nftService.queryDetail(q);
            expect(data).toBeDefined();
        });
    });


    // describe('findListByName', () => {
    //     it('should return nft name list', async () => {
    //         const data: INftStruct[] = await nftService.findListByName('sunshine');
    //         expect(data).toBeDefined();
    //     });
    // });

});

