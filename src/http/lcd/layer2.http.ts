import { HttpService, Injectable } from '@nestjs/common';
import {SpaceDetailDto} from "../../dto/http.dto";
import {cfg} from "../../config/config";
import {Logger} from "../../logger";

@Injectable()
export class Layer2Http {
    async querySpaceFromLcdBySpaceId(spaceId: string): Promise<SpaceDetailDto> {
        const url: string = `${cfg.serverCfg.lcdAddr}/iritamod/side-chain/v1/spaces/${spaceId}`;
        try {
            const data: any = await new HttpService().get(url).toPromise().then(res => res.data);
            if(data && data.space){
                return new SpaceDetailDto(data.space) ;
            }else{
                Logger.warn('api-error:', 'there is no result of space from lcd');
            }

        } catch (e) {
            Logger.warn(`api-error from ${url}:`, e.message);
            // cron jobs error should not throw errors;
        }
    }
}