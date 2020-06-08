import { Controller, Get, Post, Put, Delete, Param, Query, Res, Req, Body, HttpCode } from '@nestjs/common';
import { TxService } from '../service/tx.service';
import ValidationPipe from '../pipe/validation.pipe';
import { Result } from '../api/ApiResult';
import { ListStruct } from '../api/ApiResult';
import { TxListReqDto, 
         TxListWithHeightReqDto,
         TxListWithAddressReqDto,
         TxListWithNftReqDto,
         TxListWithServicesNameReqDto,
         ServicesDetailReqDto,
         PostTxTypesReqDto,
         PutTxTypesReqDto,
         DeleteTxTypesReqDto,
         TxWithHashReqDto } from '../dto/txs.dto';
import { TxResDto, 
         TxTypeResDto } from '../dto/txs.dto';


@Controller('txs')
export class TxController {
    constructor(private readonly txService: TxService) {
    }

    @Get()
    async queryTxList(@Query(new ValidationPipe()) query: TxListReqDto): Promise<Result<ListStruct<TxResDto>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryTxList(query);
        return new Result<any>(data);
    }

    @Get("/blocks")
    async queryTxWithHeight(@Query(new ValidationPipe()) query: TxListWithHeightReqDto): Promise<Result<TxResDto>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryTxWithHeight(query);
        return new Result<any>(data);
    }

    @Get("/addresses")
    async queryTxWithAddress(@Query(new ValidationPipe()) query: TxListWithAddressReqDto):Promise<Result<ListStruct<TxResDto>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryTxWithAddress(query);
        return new Result<any>(data);
    }
    
    @Get("/nfts")
    async queryTxWithNft(@Query(new ValidationPipe()) query: TxListWithNftReqDto):Promise<Result<ListStruct<TxResDto>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryTxWithNft(query);
        return new Result<any>(data);
    }

    @Get("/services")
    async queryTxWithServiceName(@Query(new ValidationPipe()) query: TxListWithServicesNameReqDto):Promise<Result<ListStruct<TxResDto>>> {
        const data: ListStruct<TxResDto[]> = await this.txService.queryTxWithServiceName(query);
        return new Result<any>(data);
    }
    
    @Get("/services/detail/:serviceName")
    async queryTxDetailWithServiceName(@Param(new ValidationPipe()) query: ServicesDetailReqDto): Promise<Result<TxResDto>> {
        console.log(query);
        const data: TxResDto = await this.txService.queryTxDetailWithServiceName(query);
        return new Result<TxResDto>(data);
    }

    @Get("/types")
    async queryTxTypeList(): Promise<Result<ListStruct<TxTypeResDto>>> {
        const data: ListStruct<TxTypeResDto[]> = await this.txService.queryTxTypeList();
        return new Result<any>(data);
    }

    @Post("/types")
    async insertTxTypes(@Body(new ValidationPipe()) prarms:PostTxTypesReqDto): Promise<Result<ListStruct<TxTypeResDto>>> {
        const data: ListStruct<TxTypeResDto[]> = await this.txService.insertTxTypes(prarms);
        return new Result<any>(data);
    }

    @Put("/types")
    async updateTxType(@Body(new ValidationPipe()) prarms:PutTxTypesReqDto): Promise<Result<TxTypeResDto>> {
        const data: TxTypeResDto = await this.txService.updateTxType(prarms);
        return new Result<TxTypeResDto>(data);
    }

    @Delete("/types")
    async deleteTxType(@Body(new ValidationPipe()) prarms:DeleteTxTypesReqDto): Promise<Result<TxTypeResDto>> {
        const data: TxTypeResDto = await this.txService.deleteTxType(prarms);
        return new Result<TxTypeResDto>(data);
    }

    @Get(":hash")
    async queryTxWithHash(@Param(new ValidationPipe()) query: TxWithHashReqDto): Promise<Result<TxResDto>> {
        const data: TxResDto = await this.txService.queryTxWithHash(query);
        return new Result<TxResDto>(data);
    }
}


