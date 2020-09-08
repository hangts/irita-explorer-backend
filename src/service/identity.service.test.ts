import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import {ListStruct} from '../api/ApiResult';
import {IdentityService} from "./identity.service";
import {
    IdentityByAddressReqDto,
    IdentityCertificateResDto,
    IdentityInfoReqDto,
    IdentityInfoResDto,
    IdentityPubKeyAndCertificateReqDto, IdentityPubKeyResDto,
    IdentityReqDto,
    IdentityResDto
} from "../dto/Identity.dto";


describe('identityController', () => {
    let identityService: IdentityService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports:[
                AppModule
            ]
        }).compile();
        identityService = module.get<IdentityService>(IdentityService);
    });

    describe('queryIdentityList', () => {
        it('should return identity list', async () => {
            let req: IdentityReqDto = {
                pageNum: 1,
                pageSize: 10,
                useCount: true,
                search: ''
            };
            const data: ListStruct<IdentityResDto[]> = await identityService.queryTxIdentities(req);
            expect(data).toBeDefined();
        });
    });

    describe('queryIdentityInfo', () => {
        it('should return identity Info', async () => {
            let req: IdentityInfoReqDto = {
                id: 'FE07744A503F4A80CA572CC65FAA91C6',
            };
            const data: IdentityInfoResDto = await identityService.queryIdentityInfoById(req);
            expect(data).toBeDefined();
        });
    });
    describe('queryIdentityPubKeyList', () => {
        it('should return pubKey list', async () => {
            let req: IdentityPubKeyAndCertificateReqDto = {
                pageNum: 1,
                pageSize: 10,
                useCount: true,
                id: '1E24917932E900CEA07FF684293B3FCD'
            };
            const data: ListStruct<IdentityPubKeyResDto[]> = await identityService.queryPubkey(req);
            expect(data).toBeDefined();
        });
    });
    describe('queryIdentityCertificateList', () => {
        it('should return certificate list', async () => {
            let req: IdentityPubKeyAndCertificateReqDto = {
                pageNum: 1,
                pageSize: 10,
                useCount: true,
                id: '9817E29ADFB1742EBD69375ACBE2745F'
            };
            const data: ListStruct<IdentityCertificateResDto[]> = await identityService.queryCertificate(req);
            expect(data).toBeDefined();
        });
    });

    describe('queryIdentityListByAddress', () => {
        it('should return Identity list', async () => {
            let req: IdentityByAddressReqDto = {
                pageNum: 1,
                pageSize: 10,
                useCount: true,
                address: 'iaa1c6n6xxz6qs2s60f9dzmnw2zwqjv04kah4sjv64'
            };
            const data: ListStruct<IdentityResDto[]> = await identityService.queryIdentityListByAddress(req);
            expect(data).toBeDefined();
        });
    });

});
