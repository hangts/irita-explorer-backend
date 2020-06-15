import { Logger, HttpServer, Injectable, HttpService } from '@nestjs/common';
import { cfg } from "../../config"

@Injectable()

export class ValidatorsHttp {
    async queryValidatorsFromLcd(validatorStatus:Boolean,pageNum:number): Promise<any>{
        try {
            const validatorsLcdUrl:string = `${cfg.serverCfg.lcdAddr}/validator/validators?jailed=${validatorStatus}&page=${pageNum}&limit=100`
            const validatorsData:any = await new HttpService().get(validatorsLcdUrl).toPromise().then(result => result.data)
            if(validatorsData.result.length > 0) {
                validatorsData.result.forEach( (item:any) => {
                    item.jailed = validatorStatus
                })
            }
            return validatorsData
        }catch (e) {
            new Logger().error('api-error',e.message)
        }
    }


}
