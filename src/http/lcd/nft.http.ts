import { Logger, HttpService, Injectable } from '@nestjs/common';
import { cfg } from '../../config';

@Injectable()
export class NftHttp {
    constructor(){

    }
    async queryNftsFromLcd(name: string): Promise<any> {
        try {
            const url: string = `${cfg.serverCfg.lcdAddr}/nft/nfts/collections/${name}`;
            const data: any = await new HttpService().get(url).toPromise().then(res => res.data);
            if(data && data.result){
                return data.result;
            }else{
                new Logger().error('api-error:', 'there is no result of nft from lcd');
            }

        } catch (e) {
            new Logger().error('api-error:', e.message);
            // cron jobs error should not throw errors;
        }

    }
}