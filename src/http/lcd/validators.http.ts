import { Logger, HttpServer, Injectable, HttpService } from '@nestjs/common';
import { cfg } from "../../config"

@Injectable()

export class ValidatorsHttp {
    async queryValidatorsFromLcd(validatorStatus:boolean,pageNum:number,pageSize:number): Promise<any>{
        try {
            const validatorsLcdUrl:string = `${cfg.serverCfg.lcdAddr}/validator/validators?jailed=${validatorStatus}&page=${pageNum}&limit=${pageSize}`
            const validatorsData:any = await new HttpService().get(validatorsLcdUrl).toPromise().then(result => result.data)
            return validatorsData
        }catch (e) {
            new Logger().error('api-error',e.message)
        }
    }


}
