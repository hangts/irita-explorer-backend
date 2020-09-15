import { HttpService, Injectable } from '@nestjs/common';
import { cfg } from '../../config/config';
import { Logger } from '../../logger';


@Injectable()

export class StakingValidatorHttp {
    async queryValidatorListFromLcd(pageNum:number,pageSize:number){
        const validatorLcdUri = `${cfg.serverCfg.lcdAddr}/staking/validators?pageNum=${pageNum}&pageSize=${pageSize}`
        try {
            const stakingValidatorData:any = await new HttpService().get(validatorLcdUri).toPromise().then(result => result.data)
            if(stakingValidatorData && stakingValidatorData.result){
                return stakingValidatorData.result;
            }else{
                Logger.warn('api-error:', 'there is no result of validators from lcd');
            }
          }catch (e) {
             Logger.warn(`api-error from ${validatorLcdUri}`,e.message)
        }
    }
}
