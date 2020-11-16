import { Controller, Get, Post, Put, Delete, Param, Query, Res, Req, Body, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IritaService } from '../service/irita.service';
import { Result } from '../api/ApiResult';
// import {} from '../dto/txs.dto';

@ApiTags('/')
@Controller('/')
export class IritaController {
    constructor(private readonly iritaService: IritaService) {
    }

    @Get('config')
    async queryConfig(): Promise<Result<any>> {
        const data:any = await this.iritaService.queryConfig();
        return new Result<any>(data);
    }
}
