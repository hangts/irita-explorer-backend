import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct, Result } from '../api/ApiResult';
import {
  IdentityByAddressReqDto,
  IdentityCertificateResDto, IdentityInfoReqDto, IdentityInfoResDto,
  IdentityPubKeyAndCertificateReqDto,
  IdentityPubKeyResDto, IdentityReqDto, IdentityResDto,
} from '../dto/Identity.dto';

@Injectable()
export class IdentityService {
    constructor(
      @InjectModel('Identity') private identityModel: any,
      @InjectModel('Pubkey') private pubkeyModel:any,
      @InjectModel('Certificate') private certificateModel:any,
    ) {}
    //identity list
    async queryTxIdentities(query: IdentityReqDto): Promise<ListStruct<IdentityResDto[]>> {
      const { pageNum, pageSize, useCount } = query;
      let txIdentityListData, txIdentityData = [], count = null;
      if(pageNum && pageSize){
        txIdentityListData = await this.identityModel.queryIdentityList(query)
        txIdentityData = txIdentityListData.data
      }
      if(useCount){
        count = await this.identityModel.queryIdentityListCount(query);
      }

      return new ListStruct(IdentityResDto.bundleData(txIdentityData), Number(pageNum), Number(pageSize), count);
    }
    // identity Info
    async queryIdentityInfoById(params:IdentityInfoReqDto): Promise<IdentityInfoResDto>{
      let result: IdentityInfoResDto | null = null;
      const IdentityInfoData:IdentityInfoResDto = await this.identityModel.queryIdentityInfo(params)
      if (IdentityInfoData) {
        result = new IdentityInfoResDto(IdentityInfoData);
      }
      return result;
    }
    // identity pubkey
    async queryPubkey(query:IdentityPubKeyAndCertificateReqDto): Promise<ListStruct<IdentityPubKeyResDto[]>>{
      const { pageNum, pageSize, useCount } = query;
      let pubKeyListData, pubKeyData = [], count = null;
      if(pageNum && pageSize){
        pubKeyListData = await this.pubkeyModel.queryPubkeyList(query)
        pubKeyData = pubKeyListData.data
      }
      if(useCount){
        count = await this.pubkeyModel.queryPubkeyListCount(query);
      }

      return new ListStruct(IdentityPubKeyResDto.bundleData(pubKeyData), Number(pageNum), Number(pageSize), count);
    }
    // identity Certificate
    async queryCertificate(query:IdentityPubKeyAndCertificateReqDto): Promise<ListStruct<IdentityCertificateResDto[]>>{
      const { pageNum, pageSize, useCount } = query;
      let certificateListData, certificateData = [], count = null;
      if(pageNum && pageSize){
        certificateListData = await this.certificateModel.queryCertificate(query)
        certificateData = certificateListData.data
      }
      if(useCount){
        count = await this.certificateModel.queryCertificateCount(query);
      }

      return new ListStruct(IdentityCertificateResDto.bundleData(certificateData), Number(pageNum), Number(pageSize), count);
    }
    //identity Address
    async queryIdentityListByAddress(query:IdentityByAddressReqDto):Promise<ListStruct<IdentityResDto[]>>{
      const { pageNum, pageSize, useCount } = query;
      let txIdentitiesListData, txIdentitiesData = [], count = null;
      if(pageNum && pageSize){
        txIdentitiesListData = await this.identityModel.queryIdentityByAddress(query)
        txIdentitiesData = txIdentitiesListData.data
      }
      if(useCount){
        count = await this.identityModel.queryIdentityByAddressCount(query);
      }

      return new ListStruct(IdentityResDto.bundleData(txIdentitiesData), Number(pageNum), Number(pageSize), count);
    }
}
