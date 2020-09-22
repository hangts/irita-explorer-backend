import {HttpService, Injectable} from '@nestjs/common';
import {cfg} from '../../config/config';
import {Logger} from '../../logger';
import {
    commissionRewardsLcdDto, IconUriLcdDto,
    StakingValidatorDelegationLcdDto,
    StakingValidatorLcdDto, StakingValidatorParametersLcdDto,
    StakingValidatorSlashLcdDto, StakingValUnBondingDelLcdDto
} from "../../dto/http.dto";
import {iconUri} from "../../constant";


@Injectable()

export class StakingValidatorHttp {
    async queryValidatorListFromLcd(pageNum: number, pageSize: number) {
        const validatorLcdUri = `${cfg.serverCfg.lcdAddr}/staking/validators?pageNum=${pageNum}&pageSize=${pageSize}`
        try {
            let stakingValidatorData: any = await new HttpService().get(validatorLcdUri).toPromise().then(result =>  result.data)
            if (stakingValidatorData && stakingValidatorData.result) {
                return StakingValidatorLcdDto.bundleData(stakingValidatorData.result);
            } else {
                Logger.warn('api-error:', 'there is no result of validators from lcd');
            }
        } catch (e) {
            Logger.warn(`api-error from ${validatorLcdUri}`, e)
        }
    }

    async queryValidatorFormSlashing(validatorPubkey: string) {
        const slashValidatorUri = `${cfg.serverCfg.lcdAddr}/slashing/validators/${validatorPubkey}/signing_info`
        try {
            const stakingSlashValidatorData: any = await new HttpService().get(slashValidatorUri).toPromise().then(result => result.data)
            if (stakingSlashValidatorData && stakingSlashValidatorData.result) {
                return new StakingValidatorSlashLcdDto(stakingSlashValidatorData.result);
            } else {
                Logger.warn('api-error:', 'there is no result of validators from lcd');
            }
        } catch (e) {
            Logger.warn(`api-error from ${slashValidatorUri}`, e)
        }
    }

    async querySelfBondFromLcd(valOperatorAddr) {
        const selfBondUri = `${cfg.serverCfg.lcdAddr}/staking/validators/${valOperatorAddr}/delegations`
        try {
            const selfBondData: any = await new HttpService().get(selfBondUri).toPromise().then(result => result.data)
            if (selfBondData && selfBondData.result) {
                return StakingValidatorDelegationLcdDto.bundleData(selfBondData.result);
            } else {
                Logger.warn('api-error:', 'there is no result of validators from lcd');
            }
        } catch (e) {
            Logger.warn(`api-error from ${selfBondUri}`, e)
        }
    }

    async queryValidatorIcon(valIdentity) {
        const getIconUri = `${iconUri}${valIdentity || ''}`
        try {
            const valIconData: any = await new HttpService().get(getIconUri).toPromise().then(result => result)
            if (valIconData) {
                return new IconUriLcdDto(valIconData)
            } else {
                Logger.warn('api-error:', 'there is no result of validators from getIconUri');
            }

        } catch (e) {
            Logger.warn(`api-error from ${getIconUri}`, e)
        }
    }

    async queryParametersFromSlashing() {
        const parameterUri = `${cfg.serverCfg.lcdAddr}/slashing/parameters`
        try {
            const parameterData: any = await new HttpService().get(parameterUri).toPromise().then(result => result.data)
            if (parameterData && parameterData.result) {
                return new StakingValidatorParametersLcdDto(parameterData.result)
            } else {
                Logger.warn('api-error:', 'there is no result of validators from lcd');
            }

        } catch (e) {
            Logger.warn(`api-error from ${parameterUri}`, e)
        }
    }

    async getCommissionRewards(valAddress) {
        const getCommissionRewardsUri = `${cfg.serverCfg.lcdAddr}/distribution/validators/${valAddress}`
        try {
            const commissionRewardsData: any = await new HttpService().get(getCommissionRewardsUri).toPromise().then(result => result.data)
            if (commissionRewardsData && commissionRewardsData.result) {
                return new commissionRewardsLcdDto(commissionRewardsData.result)
            } else {
                Logger.warn('api-error:', 'there is no result of validator withdraw address from lcd');
            }

        } catch (e) {
            Logger.warn(`api-error from ${getCommissionRewardsUri}`, e)
        }
    }
    async queryValidatorDelegationsFromLcd(address){
        const getValidatorDelegationsUri  = `${cfg.serverCfg.lcdAddr}/staking/validators/${address}/delegations`
        try {
            let validatorDelegationsData: any = await new HttpService().get(getValidatorDelegationsUri).toPromise().then(result => result.data)
            if (validatorDelegationsData && validatorDelegationsData.result) {
                return StakingValidatorDelegationLcdDto.bundleData(validatorDelegationsData.result);
            } else {
                Logger.warn('api-error:', 'there is no result of validator delegations from lcd');
            }
        }catch (e) {
            Logger.warn(`api-error from ${getValidatorDelegationsUri}`, e)
        }
    }
    async queryValidatorUnBondingDelegations(address){
        const getValidatorUnBondingDelUri = `${cfg.serverCfg.lcdAddr}/staking/validators/${address}/unbonding_delegations`
        try {
            let validatorUnBondingDelegationsData: any = await new HttpService().get(getValidatorUnBondingDelUri).toPromise().then(result => result.data)
            if (validatorUnBondingDelegationsData && validatorUnBondingDelegationsData.result) {
                return StakingValUnBondingDelLcdDto.bundleData(validatorUnBondingDelegationsData.result);
            } else {
                Logger.warn('api-error:', 'there is no result of validator unBonding delegations from lcd');
            }
        }catch (e) {
            Logger.warn(`api-error from ${getValidatorUnBondingDelUri}`, e)
        }
    }
}
