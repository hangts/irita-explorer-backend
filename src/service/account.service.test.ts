import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { AccountService } from "./account.service";
import {

} from '../dto/account.dto';

describe('accountController', () => {
    let accountService : AccountService
    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports:[
                AppModule
            ]
        }).compile();
        accountService = module.get<AccountService>(AccountService);
    });

    // describe('getProposals', () => {
    //     it('should return proposals array', async () => {
    //         let req:proposalsReqDto = {
    //             pageNum:1,
    //             pageSize:10,
    //             useCount:true
    //         };
    //         let data:any = await govService.getProposals(req);
    //         expect(data).toBeDefined();
    //     });
    // });
})
