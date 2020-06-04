import { Controller, Get, Param, Query, Res, Req, Post, Body, HttpCode } from '@nestjs/common';
import { TxService } from '../service/tx.service';
import ValidationPipe from '../pipe/validation.pipe';
import { Result } from '../api/ApiResult';
import { ListStruct } from '../api/ApiResult';
import { TxListReqDto, 
         TxResDto, 
         TxListWithHeightReqDto,
         TxListWithAddressReqDto,
         TxListWithNftReqDto,
         TxListWithServicesNameReqDto,
         ServicesDetailReqDto,
         TxWithHashReqDto } from '../dto/txs.dto';

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

    @Get(":hash")
    async queryTxWithHash(@Param(new ValidationPipe()) query: TxWithHashReqDto): Promise<Result<TxResDto>> {
        const data: TxResDto = await this.txService.queryTxWithHash(query);
        return new Result<TxResDto>(data);
    }
}


