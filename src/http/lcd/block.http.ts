import { Logger, HttpService } from '@nestjs/common';
import { ErrorCodes } from '../../api/ResultCodes';
import { ApiError } from '../../api/ApiResult';
import { cfg } from '../../config';

export class BlockHttp {

    static async queryLatestBlockFromLcd(): Promise<any> {
        try {
            const url: string = `${cfg.serverCfg.lcdAddr}/blocks/latest`;
            return await new HttpService().get(url).toPromise().then(res => res.data);
        } catch (e) {
            new Logger().error('api-error:', e.message);
            throw new ApiError(ErrorCodes.failed, e.message);
        }

    }
}