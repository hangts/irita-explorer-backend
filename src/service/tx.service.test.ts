import { Test } from '@nestjs/testing';
import {TxController} from '../controller/tx.controller';
import {TxService} from '../service/tx.service';
import {TxSchema} from '../schema/tx.schema';
import { AppModule } from './../app.module';
import { TxListReqDto, 
         TxResDto, 
         TxListWithHeightReqDto,
         TxListWithAddressReqDto,
         TxListWithNftReqDto,
         TxListWithServicesNameReqDto,
         ServicesDetailReqDto,
         TxWithHashReqDto} from '../dto/txs.dto';
        
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
            let txListReq:TxListReqDto = {};
            txListReq.pageNum = '1';
            txListReq.pageSize = '2';
            txListReq.useCount = 'true';
            if (parseInt(String((Math.random()*10)%2))) {
                txListReq.type = [
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
                txListReq.status = ['1','2'][parseInt(String(Math.random()*100))%2];
            }
            if (parseInt(String((Math.random()*10)%2))) {
                txListReq.beginTime = parseInt(String((new Date().getTime()/1000 - 3600*24*30))) + '';
            }
            if (parseInt(String((Math.random()*10)%2))) {
                txListReq.endTime = parseInt(String(new Date().getTime()/1000)) + '';
            }
            console.log('===>txListReq:',txListReq);
            let data = await txService.queryTxList(txListReq);
            console.log('===>queryTxListCount:',data.data.length);
        });
    });

    describe('queryTxWithHeight', () => {
        it('should return an array of height', async () => {
            let txListReq:TxListWithHeightReqDto = {};
            txListReq.pageNum = '1';
            txListReq.pageSize = '10';
            txListReq.useCount = 'true';
            txListReq.height = '20223';
            let data = await txService.queryTxWithHeight(txListReq);
            if (data && data.data.length) {
                data.data.forEach((item)=>{
                    expect(item.height).toBe(parseInt(txListReq.height));
                });
            }else{
                expect(data.data).toBe([]);
            }
        });
    });

    describe('queryTxWithAddress', () => {
        it('should return an array of address', async () => {
            let txListReq:TxListWithAddressReqDto = {};
            txListReq.pageNum = '1';
            txListReq.pageSize = '10';
            txListReq.useCount = 'true';
            txListReq.address = 'csrb199v0qu28ynmjr2q3a0nqgcp9pyy5almmj4laec';
            let data = await txService.queryTxWithAddress(txListReq);
            if (data && data.data.length) {
                data.data.forEach((item)=>{
                    let addresses:any[] = [item.from,item.to,item.signer];
                    expect(addresses).toContain(txListReq.address);
                });
            }else{
                expect(data.data).toBe([]);
            }
        });
    });

    describe('queryTxWithNft', () => {
        it('should return an array of Nft', async () => {
            let txListReq:TxListWithNftReqDto = {};
            txListReq.pageNum = '1';
            txListReq.pageSize = '10';
            txListReq.useCount = 'true';
            txListReq.denom = 'bonddf';
            txListReq.tokenId = 'id1';

            let data = await txService.queryTxWithNft(txListReq);
            if (data && data.data.length) {
                data.data.forEach((item)=>{
                    expect(item.msgs[0].msg.denom).toBe(txListReq.denom);
                    expect(item.msgs[0].msg.id).toBe(txListReq.tokenId);
                });
            }else{
                expect(data.data).toBe([]);
            }
        });
    });

    describe('queryTxWithServiceName', () => {
        it('should return an array of ServiceName', async () => {
            let txListReq:TxListWithServicesNameReqDto = {};
            txListReq.pageNum = '1';
            txListReq.pageSize = '10';
            txListReq.useCount = 'true';
            txListReq.serviceName = 'DataAuthorization';

            let data = await txService.queryTxWithServiceName(txListReq);
            if (data && data.data.length) {
                data.data.forEach((item)=>{
                    expect(item.msgs[0].msg.service_name).toBe(txListReq.serviceName);
                });
            }else{
                expect(data.data).toBe([]);
            }
        });
    });

    describe('queryTxDetailWithServiceName', () => {
        it('should return an tx Object ', async () => {
            let txReq:ServicesDetailReqDto = {serviceName:'DataAuthorization'};

            let data:any = await txService.queryTxDetailWithServiceName(txReq);
            if (data) {
                expect(data.msgs[0].msg.name).toBe(txReq.serviceName);
            }else{
                expect(data).toBe(null);
            }
        });
    });

    describe('queryTxWithHash', () => {
        it('should return an tx object', async () => {
            let txReq:TxWithHashReqDto = {hash:'34144A4E6B171E651682967DB9D43D2F0A105FD45E1AD48EA90D002ACE04C204'};

            let data:any = await txService.queryTxWithHash(txReq);
            if (data) {
                expect(data.tx_hash).toBe(txReq.hash);
            }else{
                expect(data).toBe(null);
            }
        });
    });
});

