import { HttpService, Injectable } from '@nestjs/common';
import {cfg} from "../../config/config";
import {GovTallyParamsLcdDto, GovDepositParamsLcdDto, GovV1ProposalLcdDto} from "../../dto/http.dto";
import {Logger} from "../../logger";
@Injectable()
export class Govv1Http {
     async getTallying () {
        const url = `${cfg.serverCfg.lcdAddr}/cosmos/gov/v1/params/tallying`
        try {
            let govTallyingData: any = await new HttpService().get(url).toPromise().then(result => result.data)
            if (govTallyingData) {
                return new GovTallyParamsLcdDto(govTallyingData.tally_params);
            } else {
                Logger.warn('api-error:', 'there is no result of gov_tallying from lcd');
            }
        } catch (e) {
            Logger.warn(`api-error from ${url}`, e)
        }
    }
    async getDeposit () {
        const url = `${cfg.serverCfg.lcdAddr}/cosmos/gov/v1/params/deposit`
        try {
            let govDepositData: any = await new HttpService().get(url).toPromise().then(result => result.data)
            if (govDepositData) {
                return new GovDepositParamsLcdDto(govDepositData.deposit_params);
            } else {
                Logger.warn('api-error:', 'there is no result of gov_deposit from lcd');
            }
        } catch (e) {
            Logger.warn(`api-error from ${url}`, e)
        }
    }

    async getProposals (limit) {
        const url = `${cfg.serverCfg.lcdAddr}/cosmos/gov/v1/proposals?pagination.limit=${limit}&pagination.count_total=true`
            try {
                let proposalsData: any = await new HttpService().get(url).toPromise().then(result => result.data)
                if (proposalsData) {
                    return GovV1ProposalLcdDto.bundleData(proposalsData.proposals);
                } else {
                    Logger.warn('api-error:', 'there is no result of gov_deposit from lcd');
                }
            } catch (e) {
                Logger.warn(`api-error from ${url}`, e)
        }
    }

    async getProposalById(proposal_id: string) {
        const url = `${cfg.serverCfg.lcdAddr}/cosmos/gov/v1/proposals/${proposal_id}`
        try {
            let proposalData: any = await new HttpService().get(url).toPromise().then(result => result.data)
            if (proposalData) {
                return new GovV1ProposalLcdDto(proposalData.proposal);
            } else {
                Logger.warn('api-error:', 'there is no result of gov_deposit from lcd');
            }
        } catch (e) {
            Logger.warn(`api-error from ${url}`, e)
        }
    }
}

