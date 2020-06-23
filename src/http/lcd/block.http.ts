import { HttpService } from '@nestjs/common';
import { ErrorCodes } from '../../api/ResultCodes';
import { ApiError } from '../../api/ApiResult';
import { cfg } from '../../config/config';
import { Logger } from '../../log';

export class BlockHttp {

    static async queryLatestBlockFromLcd(): Promise<any> {
        const url: string = `${cfg.serverCfg.lcdAddr}/blocks/latest`;
        try {
            return await new HttpService().get(url).toPromise().then(res => res.data);
        } catch (e) {
            Logger.error(`api-error from ${url}:`, e.message);
            throw new ApiError(ErrorCodes.failed, e.message);
        }
    }
}