import { Test } from '@nestjs/testing';
import {TxController} from '../controller/tx.controller';
import {TxService} from '../service/tx.service';
import {TxSchema} from '../schema/tx.schema';
import { AppModule } from './../app.module';
import { TxListReqDto, 
         TxListWithHeightReqDto,
         TxListWithAddressReqDto,
         TxListWithNftReqDto,
         TxListWithServicesNameReqDto,
         ServicesDetailReqDto,
         PostTxTypesReqDto,
         PutTxTypesReqDto,
         DeleteTxTypesReqDto,
         TxWithHashReqDto} from '../dto/txs.dto';
import { TxResDto, 
         TxTypeResDto } from '../dto/txs.dto';
        
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
            let req:TxListReqDto = {};
            req.pageNum = 1;
            req.pageSize = 2;
            req.useCount = true;
            if (parseInt(String((Math.random()*10)%2))) {
                req.type = [
                'create_record',
                'mint_token',
                'burn_nft',
                'send',
                'respond_service',
                'transfer_nft',
                'edit_nft',
                'define_service',
                'bind_service',
                'call_service',
                'issue_denom',
                'mint_nft',
                'transfer_token_owner',
                'issue_token',
                'edit_token'][parseInt(String(Math.random()*100))%15];
            }
            if (parseInt(String((Math.random()*10)%2))) {
                req.status = ['1','2'][parseInt(String(Math.random()*100))%2];
            }
            if (parseInt(String((Math.random()*10)%2))) {
                req.beginTime = parseInt(String((new Date().getTime()/1000 - 3600*24*30))) + '';
            }
            if (parseInt(String((Math.random()*10)%2))) {
                req.endTime = parseInt(String(new Date().getTime()/1000)) + '';
            }
            console.log('===>req:',req);
            let data = await txService.queryTxList(req);
            console.log('===>queryTxListCount:',data.data.length);
        });
    });

    describe('queryTxWithHeight', () => {
        it('should return an array of height', async () => {
            let req:TxListWithHeightReqDto = {};
            req.pageNum = 1;
            req.pageSize = 10;
            req.useCount = true;
            req.height = '20223';
            let data = await txService.queryTxWithHeight(req);
            if (data && data.data.length) {
                data.data.forEach((item)=>{
                    expect(item.height).toBe(parseInt(req.height));
                });
            }else{
                expect(data.data).toBe([]);
            }
        });
    });

    describe('queryTxWithAddress', () => {
        it('should return an array of address', async () => {
            let req:TxListWithAddressReqDto = {};
            req.pageNum = 1;
            req.pageSize = 10;
            req.useCount = true;
            req.address = 'csrb199v0qu28ynmjr2q3a0nqgcp9pyy5almmj4laec';
            let data = await txService.queryTxWithAddress(req);
            if (data && data.data.length) {
                data.data.forEach((item)=>{
                    let addresses:any[] = [item.from,item.to,item.signer];
                    expect(addresses).toContain(req.address);
                });
            }else{
                expect(data.data).toBe([]);
            }
        });
    });

    describe('queryTxWithNft', () => {
        it('should return an array of Nft', async () => {
            let req:TxListWithNftReqDto = {};
            req.pageNum = 1;
            req.pageSize = 10;
            req.useCount = true;
            req.denom = 'bonddf';
            req.tokenId = 'id1';

            let data = await txService.queryTxWithNft(req);
            if (data && data.data.length) {
                data.data.forEach((item)=>{
                    expect(item.msgs[0].msg.denom).toBe(req.denom);
                    expect(item.msgs[0].msg.id).toBe(req.tokenId);
                });
            }else{
                expect(data.data).toBe([]);
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
                    expect(item.msgs[0].msg.service_name).toBe(req.serviceName);
                });
            }else{
                expect(data.data).toBe([]);
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

    describe('queryTxTypeList', () => {
        it('should return an array ', async () => {

            let data = await txService.queryTxTypeList();
            if (data && data.data.length) {
                console.log('====>txTypesCount:',data.data.length);
            }else{
                expect([]).toBe([]);
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
                expect(data.data).toBe([]);
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

    describe('queryTxWithHash', () => {
        it('should return an tx object', async () => {
            let req:TxWithHashReqDto = {hash:'34144A4E6B171E651682967DB9D43D2F0A105FD45E1AD48EA90D002ACE04C204'};

            let data:any = await txService.queryTxWithHash(req);
            if (data) {
                expect(data.tx_hash).toBe(req.hash);
            }else{
                expect(data).toBe(null);
            }
        });
    });
});

