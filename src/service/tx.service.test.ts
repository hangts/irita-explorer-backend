import { Test } from '@nestjs/testing';
import {TxController} from '../controller/tx.controller';
import {TxService} from './tx.service';
import { AppModule } from './../app.module';
import { Logger } from '../logger';
import {
    TxListReqDto,
    TxListWithDdcReqDto,
    TxListWithHeightReqDto,
    TxListWithAddressReqDto,
    TxListWithContextIdReqDto,
    TxListWithNftReqDto,
    TxListWithServicesNameReqDto,
    ServicesDetailReqDto,
    TxListWithCallServiceReqDto,
    TxListWithRespondServiceReqDto,
    TxWithHashReqDto, IdentityTxReqDto, TxStatisticWithAddressReqDto,
} from '../dto/txs.dto';
import { TxResDto} from '../dto/txs.dto';
import {ListStruct} from "../api/ApiResult";

describe('TxController', () => {
    let txController: TxController;
    let txService: TxService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports:[
                AppModule
            ]
          }).compile();
        txService = module.get<TxService>(TxService);
        txController = module.get<TxController>(TxController);
    });

    describe('queryTxList', () => {
        it('should return an array of txs', async () => {
            jest.setTimeout(1000000000)
            let req:TxListReqDto = {};
            req.pageNum = 1;
            req.pageSize = 1;
            req.useCount = false;
            req.countMsg = true;
            // req.type = 'mint_nft'
            // if (parseInt(String((Math.random()*10)%2))) {
            //     req.type = [
            //     TxType.ethereum_tx,
            //     TxType.mint_token,
            //     TxType.burn_nft,
            //     TxType.send,
            //     TxType.respond_service,
            //     TxType.transfer_nft,
            //     TxType.edit_nft,
            //     TxType.define_service,
            //     TxType.bind_service,
            //     TxType.call_service,
            //     TxType.issue_denom,
            //     TxType.mint_nft,
            //     TxType.transfer_token_owner,
            //     TxType.issue_token,
            //     TxType.edit_token][parseInt(String(Math.random()*100))%15];
            // }
            // if (parseInt(String((Math.random()*10)%2))) {
            //     req.status = ['1','2'][parseInt(String(Math.random()*100))%2];
            // }
            // if (parseInt(String((Math.random()*10)%2))) {
            //     req.beginTime = parseInt(String((new Date().getTime()/1000 - 3600*24*30))) + '';
            // }
            // if (parseInt(String((Math.random()*10)%2))) {
            //     req.endTime = parseInt(String(new Date().getTime()/1000)) + '';
            // }
            // Logger.log('===>req:',req);
            let data = await txService.queryTxList(req);
            console.log(JSON.stringify(data))
            // Logger.log('===>queryTxListCount:',data.data.length);
            // expect(data).toBeDefined();
        });
    });

    describe('queryTxWithHeight', () => {
        it('should return an array of height', async () => {
            let req:TxListWithHeightReqDto = {};
            req.pageNum = 1;
            req.pageSize = 10;
            req.useCount = true;
            req.height = '814808';
            let data = await txService.queryTxWithHeight(req);
            if (data && data.data.length) {
                data.data.forEach((item)=>{
                    expect(item.height).toBe(parseInt(req.height));
                });
            }else{
                expect(data.data).toBeDefined();
            }
        });
    });
    describe('queryTxWithDdc', () => {
        it('should return an array of height', async () => {
            let reqDdc:TxListWithDdcReqDto = {pageNum:1,pageSize:4,useCount:true,
                contract_address:'0x42e82933Dfa426995ff53835aD96C7b4aCcdB4C4',ddc_id:'16'};
            let data = await txService.queryTxWithDdc(reqDdc);
            console.log(JSON.stringify(data))
        });
    });
    describe('queryTxWithHash', () => {
        it('should return an array of height', async () => {
            jest.setTimeout(1000000000)
            let reqDdc:TxWithHashReqDto = {
                hash:'EEBA384B935614CD8A19C7310E0ACDFB26A4E47A946FF293BD7C26D2E543EC40'};
            let data = await txService.queryTxWithHash(reqDdc);
            console.log(JSON.stringify(data))
        });
    });

    describe('queryTxWithAddress', () => {
        it('should return an array of address', async () => {
            jest.setTimeout(1000000000)
            let req:TxListWithAddressReqDto = {};
            req.pageNum = 1;
            req.pageSize = 10;
            req.useCount = false;
            req.countMsg = false;
            req.address = 'iaa1v8xgh04q7axgn9kstudkeg7rj08ccg4eks8c8r';
            let data = await txService.queryTxWithAddress(req);
            console.log(data)
            // if (data && data.data.length) {
            //     data.data.forEach((item)=>{
            //         let addresses:any[] = [item.from,item.to,item.signer];
            //         expect(addresses).toContain(req.address);
            //     });
            // }else{
            //     expect(data.data).toBeDefined();
            // }
        });
    });

    describe('queryTxWithContextId', () => {
        it('should return an array of contextId', async () => {
            let req:TxListWithContextIdReqDto = {};
            req.pageNum = 1;
            req.pageSize = 10;
            req.useCount = true;
            req.contextId = '08901E1B9EDF8B3A020D4169C345FF2044C032DD7589B7924F8F7B8370BD05120000000000000000';
            let data = await txService.queryTxWithContextId(req);
            if (data && data.data.length) {
                expect(data.data).toBeDefined();
            }else{
                expect(data.data).toBeDefined();
            }
        });
    });

    describe('queryTxWithNft', () => {
        it('should return an array of Nft', async () => {
            let req:TxListWithNftReqDto = {};
            req.pageNum = 1;
            req.pageSize = 10;
            req.useCount = true;
            req.denomId = 'bonddf';
            req.tokenId = 'id1';

            let data = await txService.queryTxWithNft(req);
            if (data && data.data.length) {
                data.data.forEach((item)=>{
                    expect(item.msgs[0].msg.denom).toBe(req.denomId);
                    expect(item.msgs[0].msg.id).toBe(req.tokenId);
                });
            }else{
                expect(data.data).toBeDefined();
            }
        });
    });

    describe('queryTxWithServiceName', () => {
        it('should return an array of ServiceName', async () => {
            let req:TxListWithServicesNameReqDto = {};
            req.pageNum = 1;
            req.pageSize = 10;
            req.useCount = true;
            req.serviceName = 'DataAuthorization';

            let data = await txService.queryTxWithServiceName(req);
            if (data && data.data.length) {
                data.data.forEach((item)=>{
                    let service_name = item.msgs[0].msg.service_name || (item.msgs[0].msg.ex || {}).service_name;
                    expect(service_name).toBe(req.serviceName);
                });
            }else{
                expect(data.data).toBeDefined();
            }
        });
    });

    describe('queryTxDetailWithServiceName', () => {
        it('should return an tx Object ', async () => {
            let req:ServicesDetailReqDto = {serviceName:'DataAuthorization'};

            let data:any = await txService.queryTxDetailWithServiceName(req);
            if (data) {
                expect(data.msgs[0].msg.name).toBe(req.serviceName);
            }else{
                expect(data).toBe(null);
            }
        });
    });

    describe('queryTxWithCallService', () => {
        it('should return an array of callService tx', async () => {
            let req:TxListWithCallServiceReqDto = {consumerAddr:''};
            req.pageNum = 1;
            req.pageSize = 10;
            req.useCount = true;
            req.consumerAddr = 'caa1ywhamh2kc2z807762tnl8pkhypdq6f2rhprst0';

            let data = await txService.queryTxWithCallService(req);
            if (data && data.data.length) {
                expect(data.data).toBeDefined();
            }else{
                expect(data.data).toBeDefined();
            }
        });
    });


    describe('queryTxWithRespondService', () => {
        it('should return an array of respondService tx', async () => {
            let req:TxListWithRespondServiceReqDto = {providerAddr:''};
            req.pageNum = 1;
            req.pageSize = 10;
            req.useCount = true;
            req.providerAddr = 'caa1ywhamh2kc2z807762tnl8pkhypdq6f2rhprst0';

            let data = await txService.queryTxWithRespondService(req);
            if (data && data.data.length) {
                expect(data.data).toBeDefined();
            }else{
                expect(data.data).toBeDefined();
            }
        });
    });

    describe('queryTxTypeList', () => {
        it('should return an array ', async () => {

            let data = await txService.queryTxTypeList();
            if (data && data.data.length) {
                Logger.log('====>txTypesCount:',data.data.length);
            }else{
                expect(data).toBeDefined();
            }
        });
    });

    describe('queryStakingTxTypeList', () => {
        it('should return an array ', async () => {

            let data = await txService.queryStakingTxTypeList();
            if (data && data.data.length) {
                Logger.log('====>txTypesCount:',data.data.length);
            }else{
                expect(data).toBeDefined();
            }
        });
    });

    describe('queryDeclarationTxTypeList', () => {
        it('should return an array ', async () => {

            let data = await txService.queryDeclarationTxTypeList();
            if (data && data.data.length) {
                Logger.log('====>txTypesCount:',data.data.length);
            }else{
                expect(data).toBeDefined();
            }
        });
    });

    describe('insertTxTypes', () => {
        it('should return an array ', async () => {
            let req = {
                typeNames:['h'],
            }
            let data = await txService.insertTxTypes(req);
            if (data && data.data.length) {
                expect(data.data[0].typeName).toBe(req.typeNames[0]);
            }else{
                expect(data.data).toBeDefined();
            }
        });
    });

    describe('updateTxType', () => {
        it('should return an Object ', async () => {
            let req = {
                typeName:'h',
                newTypeName:'j',
            };

            let data:any = await txService.updateTxType(req);
            if (data) {
                expect(data.typeName).toBe(req.typeName);
            }else{
                expect(data).toBe(null);
            }
        });
    });

    describe('deleteTxType', () => {
        it('should return an Object ', async () => {
            let req = {
                typeName:'j',
            };

            let data = await txService.deleteTxType(req);
            if (data) {
                expect(data.typeName).toBe(req.typeName);
            }else{
                expect(data).toBe(null);
            }
        });
    });

    // describe('queryTxWithHash', () => {
    //     it('should return an tx object', async () => {
    //         let req:TxWithHashReqDto = {hash:'00BBCA17C26B570BE77E382D2B1E0853BE950902132B27350E3B1FD7F96348C2'};
    //
    //         let data:any = await txService.queryTxWithHash(req);
    //         if (data) {
    //             expect(data.tx_hash).toBe(req.hash);
    //         }else{
    //             expect(data).toBe(null);
    //         }
    //     });
    // });
    describe('queryTxByIdentity', () => {
        it('should return identity tx list', async () => {
            let req:IdentityTxReqDto = {
                id:'9817E29ADFB1742EBD69375ACBE2745F'
            };
            let data:ListStruct<TxResDto[]> = await txService.queryIdentityTx(req);
            expect(data.data).toBeDefined();
        });
    });

    describe('queryStakingTxList', () => {
        it('should return an array of txs', async () => {
            let req:TxListReqDto = {};
            req.pageNum = 1;
            req.pageSize = 2;
            req.useCount = true;
            
            Logger.log('===>req:',req);
            let data = await txService.queryStakingTxList(req);
            Logger.log('===>queryTxListCount:',data.data.length);
            expect(data).toBeDefined();
        });
    });

    describe('queryDeclarationTxList', () => {
        it('should return an array of txs', async () => {
            let req:TxListReqDto = {};
            req.pageNum = 1;
            req.pageSize = 2;
            req.useCount = true;
            
            Logger.log('===>req:',req);
            let data = await txService.queryDeclarationTxList(req);
            Logger.log('===>queryTxListCount:',data.data.length);
            expect(data).toBeDefined();
        });
    });

    describe('queryGovTxList', () => {
        it('should return an array of txs', async () => {
            let req:TxListReqDto = {};
            req.pageNum = 1;
            req.pageSize = 2;
            req.useCount = true;
            
            Logger.log('===>req:',req);
            let data = await txService.queryGovTxList(req);
            Logger.log('===>queryTxListCount:',data.data.length);
            expect(data).toBeDefined();
        });
    });

    describe('queryTxStatisticWithAddress', () => {
        it('should return count', async () => {
            let req:TxStatisticWithAddressReqDto = {};
            req.address = 'iaa18dvdutaws873zw339t38j7u0ur8y67cjmmmfca';
            req.params = '199';
            const data = await txService.queryTxStatisticWithAddress(req);
            Logger.log('===>queryTxListCount:',data);
            // expect(data).toBeDefined();
        });
    });
});

