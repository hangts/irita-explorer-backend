import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { AssetService } from './asset.service';
import { 
    AssetListReqDto, 
    AssetDetailReqDto, 
    AssetListResDto,
} from '../dto/asset.dto';
    
import { ListStruct } from '../api/ApiResult';


describe('asset module', () => {
    let assetService: AssetService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports:[
                AppModule
            ]
        }).compile();
        assetService = module.get<AssetService>(AssetService);
    });
    describe('queryBlockList', () => {
        it('should return asset list', async () => {
            let req: AssetListReqDto = {
                pageNum: 1,
                pageSize: 10,
                useCount: true,
            };

            const data: ListStruct<AssetListResDto[]> = await assetService.queryTokensList(req);
            expect(data).toBeDefined();
        });
    });

    describe('queryBlockStakingDetail', () => {
        it('should return token detail', async () => {

            let req: AssetDetailReqDto = {
                symbol:'irisdog'
            };
            const data: any = await assetService.queryTokenDetail(req);
            expect(data).toBeDefined();
        });
    });

});

