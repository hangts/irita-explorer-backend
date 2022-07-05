import {concatClassPath, getAwayNewClassPath, getBackNewClassPath, ParseClassTrace, TibcClass} from "./util.class";
import {Test} from "@nestjs/testing";
import {AppModule} from "../app.module";
import {TxTaskService} from "../task/tx.task.service";

describe('Util', () => {
    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [
                AppModule
            ]
        }).compile();
        const txTaskService = module.get<TxTaskService>(TxTaskService);
    });

    describe('funcName', () => {
        it('concatClassPath', async () => {
            //nft/A/B/class
            const data = concatClassPath('A', 'B', 'class')
            if (data === 'nft/A/B/class') {
                console.log('Ok')
            }
        });
        it('getAwayNewClassPath', async () => {
            // nft/A/B/class -> nft/A/B/C/class
            let data = getAwayNewClassPath('A', 'C', 'nft/A/B/class')
            if (data === 'nft/A/B/C/class') {
                console.log('Ok')
            }
            //class -> nft/A/B/class
            data = getAwayNewClassPath('A', 'C', 'class')
            if (data === 'nft/A/C/class') {
                console.log('Ok')
            }
            data = getAwayNewClassPath('bsnhub-mainnet', 'wenchangchain-mainnet', 'btoatestid')
            console.log(data)
        });
        it('getBackNewClassPath', async () => {
            // nft/A/B/C/class -> nft/A/B/class
            let data = getBackNewClassPath('nft/A/B/C/class')
            if (data === 'nft/A/B/class') {
                console.log('Ok')
            }
            // nft/A/B/class -> class
            data = getBackNewClassPath('nft/A/B/class')
            if (data === 'class') {
                console.log('Ok')
            }
        });
        it('TibcClass', async () => {
            //nft/A/B/class
            //tibc denom url: https://opbningxia.bsngate.com:18602/api/9979c62195e54c43a7cfa4935a2c075e/rest/irismod/nft/denoms/tibc-8C14D5114F559FD61FBE7C2FCB7AAFF7BC6C20CE2C3F7A90C20F3E7DE867C8F6
            const data = TibcClass('nft/bsnhub-mainnet/wenchangchain-mainnet', 'btoatestid')
            if (data === "tibc-8C14D5114F559FD61FBE7C2FCB7AAFF7BC6C20CE2C3F7A90C20F3E7DE867C8F6") {
                console.log('Ok')
            }
        });
        it('ParseClassTrace', async () => {
            //nft/A/B/class
            const data = ParseClassTrace('nft/bsnhub-mainnet/wenchangchain-mainnet/btoatestid')
            console.log(data)
        });
    });

});