import { Controller, Get, Post, Put, Delete, Param, Query, Res, Req, Body, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IritaService } from '../service/irita.service';
import { TokenService } from '../service/token.service';
import { Result } from '../api/ApiResult';
import { TokensReqDto } from '../dto/irita.dto';
// import {} from '../dto/txs.dto';

@ApiTags('/')
@Controller('/')
export class IritaController {
    constructor(
      private readonly iritaService: IritaService,
      private readonly tokenService: TokenService
    ) {}

    @Post("/upload-token-info")
    async uploadTokenInfo(@Body() prarms :TokensReqDto): Promise<Result<any>> {
      const data:any = await this.tokenService.uploadTokenInfo(prarms);
      return new Result<any>(data);
    }

    @Get('config')
    async queryConfig(): Promise<Result<any>> {
        const data:any = await this.iritaService.queryConfig();
        return new Result<any>(data);
    }

    @Get('/sync/status')
    async queryStatus(): Promise<Result<any>> {
        const data:any = await this.iritaService.queryStatus();
        return new Result<any>(data);
    }
}
