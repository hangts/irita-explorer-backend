import { PagingReqDto, DeepPagingReqDto } from './../dto/base.dto';
import { Controller, Get, Post, Put, Delete, Param, Query, Res, Req, Body, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TxService } from '../service/tx.service';
import { Result } from '../api/ApiResult';
import { ListStruct } from '../api/ApiResult';
import {
    TxListReqDto,
    eTxListReqDto,
    TxListWithHeightReqDto,
    TxListWithAddressReqDto,
    TxListWithContextIdReqDto,
    TxListWithNftReqDto,
    TxListWithDdcReqDto,
    TxListWithServicesNameReqDto,
    ServicesDetailReqDto,
    TxListWithCallServiceReqDto,
    TxListWithRespondServiceReqDto,
    PostTxTypesReqDto,
    PutTxTypesReqDto,
    DeleteTxTypesReqDto,
    TxWithHashReqDto,
    ServiceResDto,
    ServiceListReqDto,
    ServiceProvidersReqDto,
    ServiceProvidersResDto,
    ServiceTxReqDto,
    ServiceTxResDto,
    ServiceBindInfoReqDto,
    ServiceBindInfoResDto,
    ServiceRespondReqDto,
    ServiceRespondResDto,
    IdentityTxReqDto,
    TxListWithAssetReqDto,
    ExternalQueryRespondServiceReqDto
} from '../dto/txs.dto';
import { TxResDto,
    TxTypeResDto,
    ExternalServiceResDto,
    ExternalQueryRespondServiceResDto
} from '../dto/txs.dto';

@ApiTags('Txs')
@Controller('txs')
export class TxController {
    constructor(private readonly txService: TxService) {
    }

    @Get()
    async queryTxList(@Query() query: TxListReqDto): Promise<Result<ListStruct<TxResDto>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryTxList(query);
        return new Result<any>(data);
    }

    @Get('/staking')
    async queryStakingTxList(@Query() query: TxListReqDto): Promise<Result<ListStruct<TxResDto>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryStakingTxList(query);
        return new Result<any>(data);
    }

    @Get('/coinswap')
    async queryCoinswapTxList(@Query() query: TxListReqDto): Promise<Result<ListStruct<TxResDto>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryCoinswapTxList(query);
        return new Result<any>(data);
    }

    @Get('/declaration')
    async queryDeclarationTxList(@Query() query: TxListReqDto): Promise<Result<ListStruct<TxResDto>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryDeclarationTxList(query);
        return new Result<any>(data);
    }

    @Get('/gov')
    async queryGovTxList(@Query() query: TxListReqDto): Promise<Result<ListStruct<TxResDto>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryGovTxList(query);
        return new Result<any>(data);
    }

    // 供eageServer调用  返回数据不做过滤
    @Get('/e')
    async queryTxListEdge(@Query() query: eTxListReqDto): Promise<Result<ListStruct<any>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryTxListEdge(query);
        return new Result<any>(data);
    }

    // 供外部系统调用的 API,获取服务列表以及被调用次数
    @Get("e/services")
    async externalQueryServiceList(@Query() query: DeepPagingReqDto):Promise<Result<ListStruct<ExternalServiceResDto[]>>> {
        const data: ListStruct<ExternalServiceResDto[]> = await this.txService.externalFindServiceList(query);
        return new Result<ListStruct<ExternalServiceResDto[]>>(data);
    }

    // 供外部系统调用的 API,根据地址以及服务名获取服务被调用次数
    @Get("e/services/respond-service")
    async externalQueryRespondService(@Query() query: ExternalQueryRespondServiceReqDto):Promise<Result<ExternalQueryRespondServiceResDto>> {
        const data: ExternalQueryRespondServiceResDto = await this.txService.externalQueryRespondService(query);
        return new Result<ExternalQueryRespondServiceResDto>(data);
    }
    @Get("e/debug")//TODO (lvshenchao)
    async debug():Promise<any[]> {
        return ['debug'];
    }

    @Get("/blocks")
    async queryTxWithHeight(@Query() query: TxListWithHeightReqDto): Promise<Result<TxResDto>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryTxWithHeight(query);
        return new Result<any>(data);
    }

    @Get("/addresses")
    async queryTxWithAddress(@Query() query: TxListWithAddressReqDto):Promise<Result<ListStruct<TxResDto>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryTxWithAddress(query);
        return new Result<any>(data);
    }

    @Get("/relevance")
    async queryTxWithContextId(@Query() query: TxListWithContextIdReqDto):Promise<Result<ListStruct<TxResDto>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryTxWithContextId(query);
        return new Result<any>(data);
    }
    @Get("/nfts")
    async queryTxWithNft(@Query() query: TxListWithNftReqDto):Promise<Result<ListStruct<TxResDto>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryTxWithNft(query);
        return new Result<any>(data);
    }
    @Get("/ddcs")
    async queryTxWithDdc(@Query() query: TxListWithDdcReqDto):Promise<Result<ListStruct<TxResDto>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryTxWithDdc(query);
        return new Result<any>(data);
    }

    @Get("/services")
   /* async queryTxWithServiceName(@Query() query: TxListWithServicesNameReqDto):Promise<Result<ListStruct<TxResDto>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryTxWithServiceName(query);
        return new Result<any>(data);
    }*/
    async queryServiceList(@Query() query: ServiceListReqDto):Promise<Result<ListStruct<ServiceResDto[]>>> {
        const data: ListStruct<ServiceResDto[]> = await this.txService.findServiceList(query);
        return new Result<ListStruct<ServiceResDto[]>>(data);
    }

    @Get("/services/call-service")
    async queryTxWithCallService(@Query() query: TxListWithCallServiceReqDto):Promise<Result<ListStruct<TxResDto>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryTxWithCallService(query);
        return new Result<any>(data);
    }

    @Get("/services/respond-service")
    async queryTxWithRespondService(@Query() query: TxListWithRespondServiceReqDto):Promise<Result<ListStruct<TxResDto>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryTxWithRespondService(query);
        return new Result<any>(data);
    }

    @Get("/services/detail/:serviceName")
    async queryTxDetailWithServiceName(@Param() query: ServicesDetailReqDto): Promise<Result<TxResDto>> {
        const data: TxResDto = await this.txService.queryTxDetailWithServiceName(query);
        return new Result<TxResDto>(data);
    }

    @Get("/types")
    async queryTxTypeList(): Promise<Result<TxTypeResDto>> {
        const data: Result<TxTypeResDto[]> = await this.txService.queryTxTypeList();
        return new Result<any>(data);
    }

    @Get("/types/service")
    async queryServiceTxTypeList(): Promise<Result<ListStruct<TxTypeResDto>>> {
        const data: ListStruct<TxTypeResDto[]> = await this.txService.queryServiceTxTypeList();
        return new Result<any>(data);
    }

    @Get("/types/staking")
    async queryStakingTxTypeList(): Promise<Result<ListStruct<TxTypeResDto>>> {
        const data: ListStruct<TxTypeResDto[]> = await this.txService.queryStakingTxTypeList();
        return new Result<any>(data);
    }

    @Get("/types/declaration")
    async queryDeclarationTxTypeList(): Promise<Result<ListStruct<TxTypeResDto>>> {
        const data: ListStruct<TxTypeResDto[]> = await this.txService.queryDeclarationTxTypeList();
        return new Result<any>(data);
    }

    @Post("/types")
    async insertTxTypes(@Body() prarms:PostTxTypesReqDto): Promise<Result<ListStruct<TxTypeResDto>>> {
        const data: ListStruct<TxTypeResDto[]> = await this.txService.insertTxTypes(prarms);
        return new Result<any>(data);
    }

    @Put("/types")
    async updateTxType(@Body() prarms:PutTxTypesReqDto): Promise<Result<TxTypeResDto>> {
        const data: TxTypeResDto = await this.txService.updateTxType(prarms);
        return new Result<TxTypeResDto>(data);
    }

    @Delete("/types")
    async deleteTxType(@Body() prarms:DeleteTxTypesReqDto): Promise<Result<TxTypeResDto>> {
        const data: TxTypeResDto = await this.txService.deleteTxType(prarms);
        return new Result<TxTypeResDto>(data);
    }

    @Get("/services/providers")
    async queryServiceProviders(@Query() query: ServiceProvidersReqDto): Promise<Result<ListStruct<ServiceProvidersResDto[]>>> {
        const data: ListStruct<ServiceProvidersResDto[]> = await this.txService.queryServiceProviders(query);
        return new Result<ListStruct<ServiceProvidersResDto[]>>(data);
    }

    @Get("/services/tx")
    async queryServiceTx(@Query() query: ServiceTxReqDto): Promise<Result<ListStruct<ServiceTxResDto[]>>> {
        const data: ListStruct<ServiceTxResDto[]> = await this.txService.queryServiceTx(query);
        return new Result<ListStruct<ServiceTxResDto[]>>(data);
    }

    @Get("/services/bind_info")
    async queryServiceBindInfo(@Query() query: ServiceBindInfoReqDto): Promise<Result<ServiceBindInfoResDto>> {
        const data: ServiceBindInfoResDto = await this.txService.queryServiceBindInfo(query);
        return new Result<ServiceBindInfoResDto>(data);
    }

    @Get("/services/respond")
    async queryServiceRespondTx(@Query() query: ServiceRespondReqDto): Promise<Result<ListStruct<ServiceRespondResDto[]>>> {
        const data: ListStruct<ServiceRespondResDto[]> = await this.txService.queryServiceRespondTx(query);
        return new Result<ListStruct<ServiceRespondResDto[]>>(data);
    }
    @Get("/identity")
    async queryIdentityTx(@Query() query: IdentityTxReqDto): Promise<Result<ListStruct<TxResDto[]>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryIdentityTx(query)
        return new Result<ListStruct<TxResDto[]>>(data);
    }


    @Get("/asset")
    async queryTxWithAsset(@Query() query: TxListWithAssetReqDto): Promise<Result<TxResDto>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryTxWithAsset(query);
        return new Result<any>(data);
    }

    @Get(":hash")
    async queryTxWithHash(@Param() query: TxWithHashReqDto): Promise<Result<TxResDto>> {
        const data: TxResDto = await this.txService.queryTxWithHash(query);
        return new Result<TxResDto>(data);
    }

    @Get("/types/gov")
    async queryGovTxTypeList(): Promise<Result<TxTypeResDto[]>>{
        const data: TxTypeResDto[]= await this.txService.queryGovTxTypeList();
        return new Result<TxTypeResDto[]>(data);
    }


}
