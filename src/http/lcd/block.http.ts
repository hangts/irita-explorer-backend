import { HttpService } from '@nestjs/common';
import { ErrorCodes } from '../../api/ResultCodes';
import { ApiError } from '../../api/ApiResult';
import { cfg } from '../../config/config';
import { Logger } from '../../logger';
import { BlockDto } from '../../dto/http.dto';
export class BlockHttp {

    static async queryLatestBlockFromLcd(): Promise<BlockDto> {
        const url: string = `${cfg.serverCfg.lcdAddr}/blocks/latest`;
        try {
            return await new HttpService().get(url).toPromise().then(res => {
            	return new BlockDto(res.data);
            });
        } catch (e) {
            Logger.warn(`api-error from ${url}:`, e.message);
            throw new ApiError(ErrorCodes.failed, e.message);
        }
    }
}