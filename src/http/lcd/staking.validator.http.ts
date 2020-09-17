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
    async queryValidatorFormSlashing (validatorPubkey:string) {
        const slashValidatorUri = `${cfg.serverCfg.lcdAddr}/slashing/validators/${validatorPubkey}/signing_info`
        try {
            const stakingSlashValidatorData:any = await new HttpService().get(slashValidatorUri).toPromise().then(result => result.data)
            if(stakingSlashValidatorData && stakingSlashValidatorData.result){
                return stakingSlashValidatorData.result;
            }else{
                Logger.warn('api-error:', 'there is no result of validators from lcd');
            }
        }catch (e) {
            Logger.warn(`api-error from ${slashValidatorUri}`,e.message)
        }
    }

    async queryValDelegationFormLcd(valAddr:string){
        const valDelegationUri = `${cfg.serverCfg.lcdAddr}/staking/validators/${valAddr}/delegations`
        try {
            const valDelegationData:any = await new HttpService().get(valDelegationUri).toPromise().then(result => result.data)
            if(valDelegationData && valDelegationData.result){
                return valDelegationData.result;
            }else{
                Logger.warn('api-error:', 'there is no result of validators from lcd');
            }
        }catch (e) {
            Logger.warn(`api-error from ${valDelegationUri}`,e.message)
        }
    }
    async querySelfBondFromLcd(valOperatorAddr:string){
        const selfBondUri = `${cfg.serverCfg.lcdAddr}/staking/validators/${valOperatorAddr}/delegations`
        try {
            const selfBondData:any = await new HttpService().get(selfBondUri).toPromise().then(result => result.data)
            if(selfBondData && selfBondData.result){
                return selfBondData.result;
            }else{
                Logger.warn('api-error:', 'there is no result of validators from lcd');
            }
        }catch (e) {
            Logger.warn(`api-error from ${selfBondUri}`,e.message)
        }
    }
    async queryValidatorIcon(valIdentity){
        const getIconUri  = `https://keybase.io/_/api/1.0/user/lookup.json?fields=pictures&key_suffix=${valIdentity}`
        try {
            const valIconData:any = await new HttpService().get(getIconUri).toPromise().then(result => result)
            if(valIconData){
                return valIconData
            }else {
                Logger.warn('api-error:', 'there is no result of validators from getIconUri');
            }

        }catch (e) {
            Logger.warn(`api-error from ${getIconUri}`,e.message)
        }
    }
    async queryParametersFromSlashing(){
        const parameterUri = `${cfg.serverCfg.lcdAddr}/slashing/parameters`
        try {
            const parameterData:any = await new HttpService().get(parameterUri).toPromise().then(result => result.data)
            if(parameterData  && parameterData.result){
                return parameterData.result
            }else {
                Logger.warn('api-error:', 'there is no result of validators from lcd');
            }

        }catch (e) {
            Logger.warn(`api-error from ${parameterUri}`,e.message)
        }
    }
}
