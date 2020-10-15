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
      const txIdentitiesData = await this.identityModel.queryIdentityList(query)
      return new ListStruct(IdentityResDto.bundleData(txIdentitiesData.data), Number(query.pageNum), Number(query.pageSize), txIdentitiesData.count);
    }
    // identity Info
    async queryIdentityInfoById(params:IdentityInfoReqDto): Promise<IdentityInfoResDto>{
      const IdentityInfoData:IdentityInfoResDto = await this.identityModel.queryIdentityInfo(params)
      return new IdentityInfoResDto(IdentityInfoData)
    }
    // identity pubkey
    async queryPubkey(query:IdentityPubKeyAndCertificateReqDto): Promise<ListStruct<IdentityPubKeyResDto[]>>{
      const pubKeyList = await this.pubkeyModel.queryPubkeyList(query)
      return new ListStruct(IdentityPubKeyResDto.bundleData(pubKeyList.data), Number(query.pageNum), Number(query.pageSize), pubKeyList.count);
    }
    // identity Certificate
    async queryCertificate(query:IdentityPubKeyAndCertificateReqDto): Promise<ListStruct<IdentityCertificateResDto[]>>{
      const certificateList = await this.certificateModel.queryCertificate(query)
      return new ListStruct(IdentityCertificateResDto.bundleData(certificateList.data), Number(query.pageNum), Number(query.pageSize), certificateList.count);
    }
    //identity Address
    async queryIdentityListByAddress(query:IdentityByAddressReqDto):Promise<ListStruct<IdentityResDto[]>>{
      const txIdentitiesData = await this.identityModel.queryIdentityByAddress(query)
      return new ListStruct(IdentityResDto.bundleData(txIdentitiesData.data), Number(query.pageNum), Number(query.pageSize), txIdentitiesData.count);
    }
}
