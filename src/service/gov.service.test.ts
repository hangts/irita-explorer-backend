import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { GovService } from "./gov.service";
import {
    proposalsReqDto
} from '../dto/gov.dto';

describe('govController', () => {
    let govService : GovService
    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports:[
                AppModule
            ]
        }).compile();
        govService = module.get<GovService>(GovService);
    });

    describe('getProposals', () => {
        it('should return proposals array', async () => {
            let req:proposalsReqDto = {
                pageNum:1,
                pageSize:10,
                useCount:true
            };
            let data:any = await govService.getProposals(req);
            expect(data).toBeDefined();
        });
    });
})

