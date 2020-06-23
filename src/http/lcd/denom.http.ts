import { HttpService, Injectable } from '@nestjs/common';
import { cfg } from '../../config/config';
import { Logger } from '../../log';

@Injectable()
export class DenomHttp {
    constructor(){

    }
    async queryDenomsFromLcd(): Promise<any> {
        const url: string = `${cfg.serverCfg.lcdAddr}/nft/nfts/denoms`;
        try {
            const data: any = await new HttpService().get(url).toPromise().then(res => res.data);
            if(data && data.result){
                return data.result;
            }else{
                Logger.warn('api-error:', 'there is no result of denoms from lcd');
            }

        } catch (e) {
            Logger.warn(`api-error from ${url}:`, e.message);
            // cron jobs error should not throw errors;
        }

    }
}