import { Controller, Get, Param, Query, Res, Req, Post, Body, HttpCode } from '@nestjs/common';
import { IDenomQueryParams } from '../types/denom.interface';
import { DenomService } from '../service/denom.service';
import { CreateDenomDto } from '../dto/create.denom.dto';
import { DenomValidationPipe } from '../pipe/denom.validation.pipe';
import { Result } from '../api/ApiResult';
import { ListStruct } from '../api/ApiResult';


@Controller('denoms')
export class DenomController {
    constructor(private readonly denomService: DenomService) {
    }

    @Get()
    async queryDenomList(@Query() q: IDenomQueryParams): Promise<Result<ListStruct<any>>> {
        console.log(process.env.NODE_ENV);
        const data: ListStruct<any> = await this.denomService.queryDenomList(q);
        return new Result<any>(data);
    }

    @Post('create')
    async saveDenom(@Body(new DenomValidationPipe()) createDenomDto: CreateDenomDto): Promise<Result<CreateDenomDto>> {
        const res: CreateDenomDto = await this.denomService.createDenom(createDenomDto);
        return  new Result<any>(res);
    }
}