import { HttpService } from '@nestjs/common';
import { ErrorCodes } from '../../api/ResultCodes';
import { ApiError } from '../../api/ApiResult';
import { cfg } from '../../config/config';
import { Logger } from '../../logger';
import { Validatorset, BlockDto} from '../../dto/http.dto';

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

    static async queryBlockFromLcd(height: string|number): Promise<BlockDto> {
        const url: string = `${cfg.serverCfg.lcdAddr}/blocks/${height}`;
        try {
            const data: any = await new HttpService().get(url).toPromise().then(res => res.data);
            if (data) {
            	return new BlockDto(data);
            }
        } catch (e) {
            Logger.warn(`api-error from ${url}:`, e.message);
            throw new ApiError(ErrorCodes.failed, e.message);
        }
    }

    static async queryValidatorsets(height:string|number): Promise<Validatorset[]> {
        const url: string = `${cfg.serverCfg.lcdAddr}/validatorsets/${height}`;
        try {
            const data: any = await new HttpService().get(url).toPromise().then(res => res.data);
            if (data && data.result) {
            	return Validatorset.bundleData(data.result.validators);
            }
        } catch (e) {
            Logger.warn(`api-error from ${url}:`, e.message);
            // throw new ApiError(ErrorCodes.failed, e.message);
        }
    }

}
