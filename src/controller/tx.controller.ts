import { DeepPagingReqDto } from './../dto/base.dto';
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Query,
    Body,
    UseInterceptors
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TxService } from '../service/tx.service';
import {ListStruct, Result, DomainResult} from '../api/ApiResult';
import {
    TxListReqDto,
    eTxListReqDto,
    TxListWithHeightReqDto,
    TxListWithAddressReqDto,
    TxStatisticWithAddressReqDto,
    TxListWithContextIdReqDto,
    TxListWithNftReqDto,
    TxListWithDdcReqDto,
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
    ExternalQueryRespondServiceReqDto, TxStatisticWithAddressResDto
} from '../dto/txs.dto';
import { TxResDto,
    TxTypeResDto,
    ExternalServiceResDto,
    ExternalQueryRespondServiceResDto
} from '../dto/txs.dto';
import {ErrorCodes} from "../api/ResultCodes";
import {ResponseInterceptor} from "../interceptor/response.interceptor";

@ApiTags('Txs')
@Controller('txs')
export class TxController {
    constructor(private readonly txService: TxService) {
    }

    @Get()
    @UseInterceptors(ResponseInterceptor)
    async queryTxList(@Query() query: TxListReqDto): Promise<Result<ListStruct<TxResDto>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryTxList(query);
        if (query.last_update_time && query.last_update_time != 0 && query.last_update_time == data.last_update_time){
            return new Result<any>(data, ErrorCodes.NoModified);
        }
        return new Result<any>(data);
    }

    @Get('/staking')
    @UseInterceptors(ResponseInterceptor)
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
    @UseInterceptors(ResponseInterceptor)
    async queryDeclarationTxList(@Query() query: TxListReqDto): Promise<Result<ListStruct<TxResDto>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryDeclarationTxList(query);
        return new Result<any>(data);
    }

    @Get('/gov')
    @UseInterceptors(ResponseInterceptor)
    async queryGovTxList(@Query() query: TxListReqDto): Promise<Result<ListStruct<TxResDto>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryGovTxList(query);
        return new Result<any>(data);
    }

    // 供edgeServer和coinswap调用  返回数据不做过滤
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
    @UseInterceptors(ResponseInterceptor)
    async queryTxWithHeight(@Query() query: TxListWithHeightReqDto): Promise<Result<TxResDto>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryTxWithHeight(query);
        return new Result<any>(data);
    }

    @Get("/addresses")
    @UseInterceptors(ResponseInterceptor)
    async queryTxWithAddress(@Query() query: TxListWithAddressReqDto):Promise<Result<ListStruct<TxResDto>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryTxWithAddress(query);
        return new Result<any>(data);
    }

    @Get("/addresses/statistic")
    async queryTxStatisticWithAddress(@Query() query: TxStatisticWithAddressReqDto):Promise<Result<ListStruct<TxResDto>>> {
        const data:TxStatisticWithAddressResDto = await this.txService.queryTxStatisticWithAddress(query);
        return new Result<any>(data);
    }

    @Get("/relevance")
    async queryTxWithContextId(@Query() query: TxListWithContextIdReqDto):Promise<Result<ListStruct<TxResDto>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryTxWithContextId(query);
        return new Result<any>(data);
    }
    @Get("/nfts")
    @UseInterceptors(ResponseInterceptor)
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
    @UseInterceptors(ResponseInterceptor)
    async queryServiceList(@Query() query: ServiceListReqDto):Promise<Result<ListStruct<ServiceResDto[]>>> {
        const data: ListStruct<ServiceResDto[]> = await this.txService.findServiceList(query);
        return new Result<ListStruct<ServiceResDto[]>>(data);
    }

    @Get("/services/call-service")
    @UseInterceptors(ResponseInterceptor)
    async queryTxWithCallService(@Query() query: TxListWithCallServiceReqDto):Promise<Result<ListStruct<TxResDto>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryTxWithCallService(query);
        return new Result<any>(data);
    }

    @Get("/services/respond-service")
    @UseInterceptors(ResponseInterceptor)
    async queryTxWithRespondService(@Query() query: TxListWithRespondServiceReqDto):Promise<Result<ListStruct<TxResDto>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryTxWithRespondService(query);
        return new Result<any>(data);
    }

    @Get("/services/detail/:serviceName")
    @UseInterceptors(ResponseInterceptor)
    async queryTxDetailWithServiceName(@Param() query: ServicesDetailReqDto): Promise<Result<DomainResult<TxResDto>>> {
        const data: TxResDto = await this.txService.queryTxDetailWithServiceName(query);
        return new Result(new DomainResult(data));
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
    @UseInterceptors(ResponseInterceptor)
    async queryServiceProviders(@Query() query: ServiceProvidersReqDto): Promise<Result<ListStruct<ServiceProvidersResDto[]>>> {
        const data: ListStruct<ServiceProvidersResDto[]> = await this.txService.queryServiceProviders(query);
        return new Result<ListStruct<ServiceProvidersResDto[]>>(data);
    }

    @Get("/services/tx")
    @UseInterceptors(ResponseInterceptor)
    async queryServiceTx(@Query() query: ServiceTxReqDto): Promise<Result<ListStruct<ServiceTxResDto[]>>> {
        const data: ListStruct<ServiceTxResDto[]> = await this.txService.queryServiceTx(query);
        return new Result<ListStruct<ServiceTxResDto[]>>(data);
    }

    @Get("/services/bind_info")
    @UseInterceptors(ResponseInterceptor)
    async queryServiceBindInfo(@Query() query: ServiceBindInfoReqDto): Promise<Result<DomainResult<ServiceBindInfoResDto>>> {
        const data: ServiceBindInfoResDto = await this.txService.queryServiceBindInfo(query);
        return new Result(new DomainResult(data));
    }

    @Get("/services/respond")
    @UseInterceptors(ResponseInterceptor)
    async queryServiceRespondTx(@Query() query: ServiceRespondReqDto): Promise<Result<ListStruct<ServiceRespondResDto[]>>> {
        const data: ListStruct<ServiceRespondResDto[]> = await this.txService.queryServiceRespondTx(query);
        return new Result<ListStruct<ServiceRespondResDto[]>>(data);
    }
    @Get("/identity")
    @UseInterceptors(ResponseInterceptor)
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
    @UseInterceptors(ResponseInterceptor)
    async queryTxWithHash(@Param() query: TxWithHashReqDto): Promise<Result<DomainResult<TxResDto>>> {
        const data: TxResDto = await this.txService.queryTxWithHash(query);
        return new Result(new DomainResult(data));
    }

    @Get("/types/gov")
    async queryGovTxTypeList(): Promise<Result<TxTypeResDto[]>>{
        const data: TxTypeResDto[]= await this.txService.queryGovTxTypeList();
        return new Result<TxTypeResDto[]>(data);
    }


}
