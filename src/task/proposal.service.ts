import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from "mongoose"
import { GovHttp } from "../http/lcd/gov.http";
import { proposalStatus, govParams,voteOptions } from '../constant'
import { StakingHttp } from "../http/lcd/staking.http";
import {addressTransform} from "../util/util";
import {addressPrefix} from "../constant";
@Injectable()
export class ProposalTaskService {
    constructor(
        @InjectModel('ParametersTask') private parametersTaskModel: Model<any>,
        @InjectModel('Tx') private txModel: any,
        @InjectModel('Proposal') private proposalModel: any,
        @InjectModel('StakingSyncValidators') private stakingValidatorsModel: any,
        private readonly govHttp: GovHttp,
        private readonly stakingHttp: StakingHttp
    ) {
        this.doTask = this.doTask.bind(this);
    }
    async doTask(): Promise<void> {
        try {
            console.log('Proposal 开始执行任务啦')
            const proposalFromLcd = await this.govHttp.getProposals();
            const proposalFromDb = await this.proposalModel.queryAllProposals();
            const govParamsFromDb = await (this.parametersTaskModel as any).queryGovParams();
            let govParamsFromDbMap = new Map();
            let proposalFromLcdMap = new Map();
            let proposalFromDbMap = new Map();
            if (govParamsFromDb && govParamsFromDb.length > 0) {
                govParamsFromDb.forEach(item => {
                    govParamsFromDbMap.set(item.key, item)
                });
            }
            if (proposalFromLcd && proposalFromLcd.length > 0) {
                proposalFromLcd.forEach(item => {
                    proposalFromLcdMap.set(item.id, item)
                })
            }
            let deleteIdData = []
            if (proposalFromDb && proposalFromDb.length > 0) {
                proposalFromDb.forEach(item => {
                    proposalFromDbMap.set(item.id, item)
                    if (!proposalFromLcdMap.has(item.id)) {
                        deleteIdData.push(item.id)
                    }
                })
            }
            if (deleteIdData.length > 0) {
                this.proposalModel.updateProposals(deleteIdData)
            }
            // 以上删除提案已完成
            let insertData = [];
            let insertIds = [];
            if (proposalFromLcdMap.size > 0) {
                proposalFromLcdMap.forEach(item => {
                    if (!proposalFromDbMap.has(item.id)) {
                        insertData.push(item);
                        insertIds.push(item.id);
                    }
                })
            }
            for (const item of insertData) {
                let txData = await this.txModel.querySubmitProposalById(item.id)
                item.proposer = txData && txData.msgs && txData.msgs[0] && txData.msgs[0].msg && txData.msgs[0].msg.proposer || '';
                item.initial_deposit = txData && txData.msgs && txData.msgs[0] && txData.msgs[0].msg && txData.msgs[0].msg.initial_deposit || {};
                item.status = proposalStatus[item.status];
                if (item.content && item.content.type) {
                    item.content.type = this.splitString(item.content.type);
                }
                item.submit_time = this.formatDate(item.submit_time);
                item.deposit_end_time = this.formatDate(item.deposit_end_time);
                item.voting_start_time = this.formatDate(item.voting_start_time);
                item.voting_end_time = this.formatDate(item.voting_end_time);
                item.min_deposit = govParamsFromDbMap.get(govParams.min_deposit).cur_value;
                item.quorum = govParamsFromDbMap.get(govParams.quorum).cur_value;
                item.threshold = govParamsFromDbMap.get(govParams.threshold).cur_value;
                item.veto_threshold = govParamsFromDbMap.get(govParams.veto_threshold).cur_value;
            }
            // 以上添加 proposer and initial_deposit 修改字段完成
            let updateDbData = proposalFromDb.filter(item => {
                return item.status == proposalStatus['PROPOSAL_STATUS_DEPOSIT_PERIOD'] || item.status == proposalStatus['PROPOSAL_STATUS_VOTING_PERIOD']
            })
            let updateData = updateDbData.concat(insertData)

            for (const proposal of updateData) {
                // 条件待删除
                if (proposal.status == proposalStatus['PROPOSAL_STATUS_VOTING_PERIOD'] || true) {
                    // 开始计算
                    const validators = await this.stakingValidatorsModel.queryActiveVal()
                    let validatorsMap = new Map();
                    let systemVotingPower = 0;
                    let totalVotingPower = 0;
                    let delegatorsGovInfo = {};
                    let validatorGovInfo = {};
                    if (validators && validators.length > 0) {
                        validators.forEach(validator => {
                            validatorGovInfo[validator.operator_address] = {
                                address: validator.operator_address,
                                moniker: validator.description && validator.description.moniker || '',
                                bondedtokens: Number(validator.tokens),
                                delShares: validator.delegator_shares
                            }
                            validatorsMap.set(validator.operator_address, validator)
                            // todo: duanjie 使用大数计算
                            systemVotingPower += Number(validator.tokens)
                        });
                    }
                    
                    const votes = await this.txModel.queryVoteByProposalId(Number(proposal.id))
                    if (votes && votes.length > 0) {
                        for (let vote of votes) {
                            vote = vote && vote.msg && vote.msg[0]
                            delegatorsGovInfo[vote.voter] = {
                                address: vote.voter,
                                vote: voteOptions[vote.option]
                            }
                            let delegatorsDelegationsFromLcd = await this.stakingHttp.queryDelegatorsDelegationsFromLcd(vote.voter)
                            let delegators = []
                            if (delegatorsDelegationsFromLcd && delegatorsDelegationsFromLcd.result && delegatorsDelegationsFromLcd.result.length > 0) {
                                delegatorsDelegationsFromLcd.result.forEach(item => {
                                    if (validatorsMap.has(item.delegation.validator_address)) {
                                        delegators.push(item.delegation)
                                    }
                                })
                            }
                            if (delegators.length > 0) {
                                delegators.forEach(delegator => {
                                    let voteIva = addressTransform(vote.voter, addressPrefix.iva)
                                    if (delegator.validator_address == voteIva) {
                                        delegatorsGovInfo[vote.voter].isValidator = true
                                    }
                                })
                            }
                        }
                    }
                    console.log(validatorGovInfo)
                    // console.log(delegatorsGovInfo)




                } else {
                    if (!insertIds.includes(proposal.id)) {
                        let proposalFromLcd = proposalFromLcdMap.get(proposal.id);
                        proposal.status = proposalStatus[proposalFromLcd.status];
                        proposal.final_tally_result = proposalFromLcd.final_tally_result
                        proposal.total_deposit = proposalFromLcd.total_deposit
                    }
                }
            }
        } catch (e) {
            console.log(e)
        }
    }

    splitString(str) {
        let array = str.split('.')
        return array[array.length - 1]
    }

    formatDate(str) {
        return Math.floor(new Date(str).getTime() / 1000)
    }
}
