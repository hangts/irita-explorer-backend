import { Logger, HttpService, Injectable } from '@nestjs/common';
import { ErrorCodes, ResultCodesMaps } from '../api/ResultCodes';
import { ApiError } from '../api/ApiResult';
import { cfg } from '../config';

@Injectable()
export class BlockHttp {
    constructor(private readonly httpService: HttpService) {
    }

    async queryLatestBlockFromLcd(): Promise<any>{
        try {
            const url: string = `${cfg.serverCfg.lcdAddr}/blocks/latest`;
            return await this.httpService.get(url).toPromise().then(res => res.data);
        } catch (e) {
            new Logger().error('api-error:',e.message);
            throw new ApiError(ErrorCodes.failed, ResultCodesMaps.get(ErrorCodes.failed));
        }

    }
}