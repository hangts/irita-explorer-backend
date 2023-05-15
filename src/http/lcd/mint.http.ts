import { HttpService, Injectable } from '@nestjs/common';
import {cfg} from "../../config/config";
import {MintParamsLcdDto} from "../../dto/http.dto";
import {Logger} from "../../logger";
@Injectable()
export class MintHttp {
     async getMintParams () {
        const url = `${cfg.serverCfg.lcdAddr}/irishub/mint/params`
        try {
            const mintParams: any = await new HttpService().get(url).toPromise().then(result => result.data)
            if (mintParams) {
                return new MintParamsLcdDto(mintParams.params);
            } else {
                Logger.warn('api-error:', 'there is no result of mintParams from lcd');
            }
        } catch (e) {
            Logger.warn(`api-error from ${url}`, e)
        }
    }

}

