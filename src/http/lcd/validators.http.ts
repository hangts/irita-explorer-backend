import { Logger, HttpServer, Injectable, HttpService } from '@nestjs/common';
import { cfg } from "../../config"

@Injectable()

export class ValidatorsHttp {
    async queryValidatorsFromLcd(validatorStatus:boolean,pageNum:number,pageSize:number): Promise<any>{
        const validatorsLcdUrl:string = `${cfg.serverCfg.lcdAddr}/validator/validators?jailed=${validatorStatus || ''}&page=${pageNum}&limit=${pageSize}`
        try {
            const validatorsData:any = await new HttpService().get(validatorsLcdUrl).toPromise().then(result => result.data)
            if(validatorsData && validatorsData.result){
                return validatorsData.result;
            }else{
            	new Logger().error('api-error:', 'there is no result of validators from lcd');
            }
        }catch (e) {
            new Logger().error(`api-error from ${validatorsLcdUrl}`,e.message)
        }
    }
}
