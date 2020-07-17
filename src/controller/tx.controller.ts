import { Controller, Get, Post, Put, Delete, Param, Query, Res, Req, Body, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TxService } from '../service/tx.service';
import { Result } from '../api/ApiResult';
import { ListStruct } from '../api/ApiResult';
import { TxListReqDto, 
         TxListWithHeightReqDto,
         TxListWithAddressReqDto,
         TxListWithContextIdReqDto,
         TxListWithNftReqDto,
         TxListWithServicesNameReqDto,
         ServicesDetailReqDto,
         PostTxTypesReqDto,
         PutTxTypesReqDto,
         DeleteTxTypesReqDto,
         TxWithHashReqDto } from '../dto/txs.dto';
import { TxResDto, 
         TxTypeResDto } from '../dto/txs.dto';

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

    @Get("/services")
    async queryTxWithServiceName(@Query() query: TxListWithServicesNameReqDto):Promise<Result<ListStruct<TxResDto>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryTxWithServiceName(query);
        return new Result<any>(data);
    }
    
    @Get("/services/detail/:serviceName")
    async queryTxDetailWithServiceName(@Param() query: ServicesDetailReqDto): Promise<Result<TxResDto>> {
        const data: TxResDto = await this.txService.queryTxDetailWithServiceName(query);
        return new Result<TxResDto>(data);
    }

    @Get("/types")
    async queryTxTypeList(): Promise<Result<ListStruct<TxTypeResDto>>> {
        const data: ListStruct<TxTypeResDto[]> = await this.txService.queryTxTypeList();
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

    @Get(":hash")
    async queryTxWithHash(@Param() query: TxWithHashReqDto): Promise<Result<TxResDto>> {
        const data: TxResDto = await this.txService.queryTxWithHash(query);
        return new Result<TxResDto>(data);
    }
}


