import {NftTaskService} from "./nft.task.service";
import {Test} from "@nestjs/testing";
import {AppModule} from "../app.module";
import {IDenomStruct} from "../types/schemaTypes/denom.interface";

describe('NftTaskService', () => {
    let nftTaskService: NftTaskService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports:[
                AppModule
            ]
        }).compile();
        nftTaskService = module.get<NftTaskService>(NftTaskService);
    });

    describe('NftTaskService doTask', () => {

        it('handleNftTx', async () => {
            jest.setTimeout(10000000)
            let nftTxList = await nftTaskService.getNftTxList(15036890, 15044161); // 9384042
            await nftTaskService.handleNftTx(nftTxList, 0,0,0);
            // console.log("=====>handleNftTx:",pool)
        });
    });
}); 