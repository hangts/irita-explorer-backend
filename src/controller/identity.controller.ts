import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ListStruct, Result } from '../api/ApiResult';
import { IdentityService } from '../service/identity.service';
import {
    IdentityByAddressReqDto,
    IdentityCertificateResDto, IdentityInfoReqDto, IdentityInfoResDto,
    IdentityPubKeyAndCertificateReqDto,
    IdentityPubKeyResDto, IdentityReqDto, IdentityResDto,
} from '../dto/Identity.dto';


@ApiTags('Identities')
@Controller('identities')
export class IdentityController {
    constructor(private readonly identityService: IdentityService ) {
    }

    @Get()
    async queryTxIdentities(@Query() query: IdentityReqDto): Promise<Result<ListStruct<IdentityResDto[]>>> {
        const data: ListStruct<IdentityResDto[]> = await this.identityService.queryTxIdentities(query)
        return new Result<ListStruct<IdentityResDto[]>>(data);
    }

    @Get('/pubkey')
    async queryPubKey(@Query() query:IdentityPubKeyAndCertificateReqDto): Promise<Result<ListStruct<IdentityPubKeyResDto[]>>> {
        const data:ListStruct<IdentityPubKeyResDto[]> = await this.identityService.queryPubkey(query)
        return new Result<ListStruct<IdentityPubKeyResDto[]>>(data)
    }
    @Get('/certificate')
    async queryCertificate(@Query() query:IdentityPubKeyAndCertificateReqDto): Promise<Result<ListStruct<IdentityCertificateResDto[]>>> {
        const data:ListStruct<IdentityCertificateResDto[]> = await this.identityService.queryCertificate(query)
        return new Result<ListStruct<IdentityCertificateResDto[]>>(data)
    }
    @Get('/address')
    async queryIdentityByAddress(@Query() query:IdentityByAddressReqDto):Promise<Result<ListStruct<IdentityResDto[]>>>{
        const data:ListStruct<IdentityResDto[]>  = await this.identityService.queryIdentityListByAddress(query)
        return  new Result<ListStruct<IdentityResDto[]>>(data)
    }
    @Get(':id')
    async queryIdentityInfo(@Param() params:IdentityInfoReqDto): Promise<Result<IdentityInfoResDto>> {
        const identityData:IdentityInfoResDto = await this.identityService.queryIdentityInfoById(params)
        return new Result<IdentityInfoResDto>(identityData)
    }
}
