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
            let nftTxList = await nftTaskService.getNftTxList(4755, 4800); // 9384042
            const denomList: IDenomStruct[] = await nftTaskService.denomList();
            let denomMap = new Map<string, string>();
            if (denomList && denomList.length > 0) {
                denomList.forEach((denom: IDenomStruct) => {
                    denomMap.set(denom.denom_id, denom.name);
                });
            }
            await nftTaskService.handleNftTx(nftTxList,denomMap);
            // console.log("=====>handleNftTx:",pool)
        });
    });
}); 