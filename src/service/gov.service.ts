import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct } from '../api/ApiResult';
import {
    proposalsReqDto,
    ProposalDetailReqDto,
    proposalsVoterReqDto
} from '../dto/gov.dto';
import {
    govProposalResDto,
    govProposalDetailResDto,
    govProposalVoterResDto,
    govProposalDepositorResDto
} from '../dto/gov.dto';
import { govParams, addressPrefix,voteOptions,proposalStatus,queryVoteOptionCount } from '../constant';
import { addressTransform,uniqueArr } from "../util/util";
@Injectable()
export class GovService {

    constructor(
        @InjectModel('Proposal') private proposalModel: any,
        @InjectModel('ProposalDetail') private proposalDetailModel: any,
        @InjectModel('Tx') private txModel: any,
        @InjectModel('StakingValidator') private stakingValidatorModel: any) { }

    async getProposals(query: proposalsReqDto): Promise<ListStruct<govProposalResDto>> {
        const proposalList = await this.proposalModel.queryProposals(query)
        for (const proposal of proposalList.data) {
            if (proposal.status == proposalStatus['PROPOSAL_STATUS_VOTING_PERIOD']) {
                const proposalsDetail = await this.proposalDetailModel.queryProposalsDetail(proposal.id)
                proposal.tally_details = proposalsDetail && proposalsDetail.tally_details || []
            }
        }
        let result: any = {}
        result.data = govProposalResDto.bundleData(proposalList.data)
        result.count = proposalList.count
        return new ListStruct(result.data, query.pageNum, query.pageSize, result.count)
    }

    async getProposalDetail(param: ProposalDetailReqDto): Promise<govProposalDetailResDto> {
        const { id } = param;
        const proposal = await this.proposalModel.findOneById(id);
        const proposalsDetail = await this.proposalDetailModel.queryProposalsDetail(id);
        if (proposal) {
            proposal.tally_details = proposalsDetail && proposalsDetail.tally_details || [];
            // todo: duanjie 使用大数计算
            if (proposal.current_tally_result) {
                if (proposal.status === proposalStatus.PROPOSAL_STATUS_REJECTED) {
                    let tally = proposal.current_tally_result;
                    let cond1 = (tally.total_voting_power / tally.system_voting_power) < proposal[govParams.quorum];
                    let cond2 = (tally.no_with_veto / tally.total_voting_power) > proposal[govParams.veto_threshold];
                    if (cond1 || cond2) {
                        proposal.burned_rate = '1';
                    } else {
                        proposal.burned_rate = '0';
                    }
                } else if (proposal.status === proposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD) {
                    let cond1 = proposal.total_deposit.amount < proposal.min_deposit;
                    if (cond1) {
                        proposal.burned_rate = '1';
                    } else {
                        proposal.burned_rate = '0';
                    }
                } else {
                    proposal.burned_rate = '0';
                }
            }
        }
        return new govProposalDetailResDto(proposal);
    }

    async getProposalsVoter(param: ProposalDetailReqDto, query: proposalsVoterReqDto): Promise<ListStruct<govProposalVoterResDto>> {
        const votesAll = await this.txModel.queryVoteByProposalIdAll(Number(param.id));
        const votes = new Map();
        if (votesAll && votesAll.length > 0) {
            votesAll.forEach(voter => {
                votes.set(voter.msgs[0].msg.voter, voter.tx_hash);
            });
        }
        let voteList = [];
        let votersData: any;
        let statistical = {
            all: 0,
            validator: 0,
            delegator: 0,
            yes: 0,
            no: 0,
            no_with_veto: 0,
            abstain: 0
        };
        let result: any = {};
        if (votes.size > 0) {
            const hashs = [...votes.values()];
            const allAddress = [...votes.keys()];
            let validators = await this.stakingValidatorModel.queryAllValidators();
            let validatorMap = {};
            validators.forEach((item) => {
                validatorMap[addressTransform(item.operator_address,addressPrefix.iaa)] = item;
            });
            [statistical.yes, statistical.abstain, statistical.no, statistical.no_with_veto] = await Promise.all([this.txModel.queryVoteByTxhashsAndOptoin(hashs, queryVoteOptionCount.yes), this.txModel.queryVoteByTxhashsAndOptoin(hashs, queryVoteOptionCount.abstain), this.txModel.queryVoteByTxhashsAndOptoin(hashs, queryVoteOptionCount.no), this.txModel.queryVoteByTxhashsAndOptoin(hashs, queryVoteOptionCount.no_with_veto)]);
            statistical.all = hashs.length;
            let validatorAdd = Object.keys(validatorMap);
            let delegatorAdd = uniqueArr(allAddress, validatorAdd);
            switch (query.voterType) {
                case 'validator':
                    votersData = await this.txModel.queryVoteByTxhashsAndAddress(hashs, validatorAdd, query);
                    statistical.validator = votersData.count;
                    statistical.delegator = statistical.all - statistical.validator;
                    break;
                case 'delegator':
                    votersData = await this.txModel.queryVoteByTxhashsAndAddress(hashs, delegatorAdd, query);
                    statistical.delegator = votersData.count;
                    statistical.validator = statistical.all - statistical.delegator;
                    break;
                default:
                    let count;
                    [votersData, count] = await Promise.all([this.txModel.queryVoteByTxhashs(hashs, query),this.txModel.queryVoteByTxhashsAndAddress(hashs, validatorAdd, query)]);
                    statistical.validator = count.count;
                    statistical.delegator = statistical.all - statistical.validator;
                    break;
            }
            if (votersData && votersData.data && votersData.data.length > 0) {
                for (const item of votersData.data) {
                    if (item.msgs && item.msgs[0] && item.msgs[0].msg) {
                        let msg = item.msgs[0].msg;
                        let isValidator: boolean = Boolean(validatorMap[msg.voter]);
                        let moniker;
                        if (validatorMap[msg.voter] &&
                            validatorMap[msg.voter].description &&
                            validatorMap[msg.voter].description.moniker) {
                            moniker = validatorMap[msg.voter].is_black ? validatorMap[msg.voter].moniker_m :validatorMap[msg.voter].description.moniker
                        }
                        voteList.push({
                            voter:msg.voter,
                            address: validatorMap[msg.voter] && validatorMap[msg.voter].operator_address,
                            moniker,
                            option: voteOptions[msg.option],
                            hash: item['tx_hash'],
                            timestamp: item['time'],
                            height: item['height'],
                            isValidator
                        })
                    }
                }
            }
        }
        result.data = govProposalVoterResDto.bundleData(voteList);
        result.count = votersData.count;
        result.statistical = statistical;
        return new ListStruct(result.data, query.pageNum, query.pageSize, result.count, result.statistical);
    }
    async addMonikerAndIva(address) {
        let validators = await this.stakingValidatorModel.queryAllValidators();
        let validatorMap = {};
        validators.forEach((item) => {
            validatorMap[item.operator_address] = item;
        });
        let moniker: string;
        let isValidator: boolean = Boolean(validatorMap[address]);
        if (validatorMap[address] &&
            validatorMap[address].description &&
            validatorMap[address].description.moniker) {
            moniker =validatorMap[address].is_black ? validatorMap[address].moniker_m : validatorMap[address].description.moniker
        }
        return {moniker,isValidator};
    }

    async getProposalsDepositor(param: ProposalDetailReqDto, query: proposalsReqDto): Promise<ListStruct<govProposalDepositorResDto>> {
        const depositorData = await await this.txModel.queryDepositorById(Number(param.id),query);
        let depositorList = [];
        if (depositorData && depositorData.data && depositorData.data.length > 0) {
            for (const deposotor of depositorData.data) {
                if (deposotor.msgs && deposotor.msgs[0] && deposotor.msgs[0].msg) {
                    let msg = deposotor.msgs[0].msg;
                    let type = deposotor.msgs[0].type;
                    if (type == 'deposit') {
                        let ivaAddress = addressTransform(msg.depositor, addressPrefix.iva)
                        let { moniker } = await this.addMonikerAndIva(ivaAddress)
                        depositorList.push({
                            hash: deposotor['tx_hash'],
                            moniker,
                            address: msg.depositor,
                            amount: msg.amount,
                            type,
                            timestamp: deposotor.time
                        })
                    } else {
                        let ivaAddress = addressTransform(msg.proposer, addressPrefix.iva)
                        let { moniker } = await this.addMonikerAndIva(ivaAddress)
                        depositorList.push({
                            hash: deposotor['tx_hash'],
                            moniker,
                            address: msg.proposer,
                            amount: msg.initial_deposit,
                            type,
                            timestamp: deposotor.time
                        })
                    }
                }
            }
        }
        let result: any = {};
        result.data = govProposalDepositorResDto.bundleData(depositorList);
        result.count = depositorData.count;
        return new ListStruct(result.data, query.pageNum, query.pageSize, result.count)
    }
}
