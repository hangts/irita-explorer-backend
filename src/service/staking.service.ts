import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {StakingHttp} from "../http/lcd/staking.http";
import {addressTransform, pageNation} from "../util/util";
import {
    activeValidatorLabel,
    addressPrefix,
    jailedValidatorLabel,
    moduleSlashing,
    ValidatorNumberStatus,
    ValidatorStatus,
    voteOptions
} from "../constant";
import {
    AccountAddrReqDto,
    AccountAddrResDto,
    allValidatorReqDto,
    CommissionInfoResDto, stakingValidatorResDto,
    ValidatorDelegationsReqDto,ValidatorDelegationsQueryReqDto,
    ValidatorDelegationsResDto, ValidatorDetailResDto,
    ValidatorUnBondingDelegationsReqDto, ValidatorUnBondingDelegationsResDto,ValidatorUnBondingDelegationsQueryReqDto,
    DelegatorsDelegationsReqDto,DelegatorsDelegationsResDto,
    DelegatorsUndelegationsReqDto, DelegatorsUndelegationsResDto,
    DelegatorsDelegationsParamReqDto, DelegatorsUndelegationsParamReqDto,
    ValidatorVotesResDto, ValidatorDepositsResDto,
    PostBlacksReqDto
} from "../dto/staking.dto";
import {ListStruct} from "../api/ApiResult";
import {BlockHttp} from "../http/lcd/block.http";
import { cfg } from '../config/config';
import {DistributionHttp} from "../http/lcd/distribution.http";

@Injectable()
export default class StakingService {
    constructor(@InjectModel('Profiler') private profilerModel: Model<any>,
                @InjectModel('StakingSyncValidators') private stakingValidatorsModel: Model<any>,
                @InjectModel('Parameters') private parametersModel: Model<any>,
                @InjectModel('Tx') private txModel: Model<any>,
                @InjectModel('Tokens') private tokensModel: any,
                @InjectModel('Proposal') private proposalModel: any,
                private readonly stakingHttp: StakingHttp,
    ) {
    }

    async getAllValidatorMonikerMap() {
        const allValidators = await (this.stakingValidatorsModel as any).queryAllValidators()
        const allValidatorsMonikerMap = new Map()
        allValidators.forEach(item => {
            allValidatorsMonikerMap.set(item.operator_address, item)
        })
        return allValidatorsMonikerMap
    }

    async getTotalVotingPower() {
        const allValidators = await (this.stakingValidatorsModel as any).queryAllValidators()
        let totalVotingPower = 0;
        allValidators.forEach(item => {
            if (item.status === ValidatorStatus['bonded'] && item.jailed === false) {
                totalVotingPower += Number(item.voting_power);
            }
        })
        return totalVotingPower
    }


    async getAllValCommission(): Promise<ListStruct<CommissionInfoResDto>> {
        const allValCommissionInfo: any = await (this.stakingValidatorsModel as any).queryAllValCommission()
        allValCommissionInfo.data = CommissionInfoResDto.bundleData(allValCommissionInfo.data)
        return allValCommissionInfo
    }

    async getValidatorDelegationList(p: ValidatorDelegationsReqDto, q: ValidatorDelegationsQueryReqDto): Promise<ListStruct<ValidatorDelegationsResDto>> {
        const validatorAddr = p.address
        const { pageNum,pageSize,useCount } = q
        let delegationData: any = [], count = null
        const allValidatorsMap = await this.getAllValidatorMonikerMap()
        const validatorDelegationsFromLcd = await this.stakingHttp.queryValidatorDelegationsFromLcd(validatorAddr, pageNum, pageSize, useCount)
        const resultData = (validatorDelegationsFromLcd?.result || []).map(item => {
            const validator = allValidatorsMap.get(item.delegation.validator_address);
            return {
                moniker: validator && validator.is_black  ? validator.moniker_m : validator.description && validator.description.moniker,
                address: item.delegation.delegator_address || '',
                amount: item.balance || '',
                self_shares: item.delegation.shares || '',
                total_shares: validator && Number(validator.delegator_shares) || 0,
            }
        })
        count = validatorDelegationsFromLcd?.total
        delegationData = ValidatorDelegationsResDto.bundleData(resultData)
        return new ListStruct(delegationData, pageNum, pageSize, count)
    }

    async getValidatorUnBondingDelegations(p: ValidatorUnBondingDelegationsReqDto,q: ValidatorUnBondingDelegationsQueryReqDto): Promise<ListStruct<ValidatorUnBondingDelegationsResDto>> {
        const validatorAddr = p.address
        const { pageNum,pageSize,useCount } = q
        const allValidatorsMoniker = await this.getAllValidatorMonikerMap()
        const valUnBondingDelegationsFromLcd = await this.stakingHttp.queryValidatorUnBondingDelegations(validatorAddr, pageNum, pageSize, useCount)
        let resultData = []
        if (valUnBondingDelegationsFromLcd?.result) {
            for (const data of valUnBondingDelegationsFromLcd?.result) {
                if (data?.entries && data.entries.length>0) {
                    for (const one of data.entries) {
                        const validator = allValidatorsMoniker.get(data.validator_address);
                        resultData.push({
                            moniker: validator && validator.is_black  ? validator?.moniker_m : validator?.description && validator?.description.moniker,
                            address: data.delegator_address || '',
                            amount: one.balance || '',
                            block: one.creation_height || '',
                            until: one.completion_time || '',
                        });
                    }

                }
            }
        }
        const count = resultData?.length
        const result: any = {}
        if (useCount) {
            result.count = count
        }
        result.data = ValidatorUnBondingDelegationsResDto.bundleData(resultData)
        return new ListStruct(result.data, pageNum, pageSize, result.count)

    }

    async getValidatorsByStatus(q: allValidatorReqDto): Promise<ListStruct<stakingValidatorResDto>> {
        const validatorList = await (this.stakingValidatorsModel as any).queryValidatorsByStatus(q)
        const totalVotingPower = await this.getTotalVotingPower()
        validatorList.data.forEach(item => {
            if (item.description && item.description.moniker && item.is_black) {
                item.description.moniker = item.moniker_m
            }
            item.icon = item.is_black ? '' : item.icon;
            item.voting_rate = item.voting_power / totalVotingPower;
        })

        let active = [], candidate = [], jailed=[], all: any[]

        validatorList.data.forEach(item => {
            if (item.jailed == false && item.status == 3) {
                active.push(item)
            }else if ((item.jailed == false && item.status == 1) || (item.jailed == false && item.status == 2)){
                candidate.push(item)
            }else if (item.jailed == true){
                jailed.push(item)
            }
        })

        //排序规则
        //第一排序级别： Active>Candidate>Jailed
        //第二排序级别： Voting Power 倒序
        active.sort((a, b) => {
            return b.voting_power - a.voting_power
        })

        candidate.sort((a, b) => {
            return b.voting_power - a.voting_power
        })

        jailed.sort((a, b) => {
            return b.voting_power - a.voting_power
        })

        all = active.concat(candidate, jailed)

        all.forEach( (item, index) => {
            item.rank = index + 1
            item.account_address = addressTransform(item.operator_address, addressPrefix.iaa)
        })
        validatorList.data = all
        const result: any = {}
        result.data = stakingValidatorResDto.bundleData(validatorList.data)
        result.count = validatorList.count
        return new ListStruct(result.data, q.pageNum, q.pageSize, result.count)
    }

    async getValidatorDetail(q: ValidatorDelegationsReqDto): Promise<ValidatorDetailResDto> {

        const validatorAddress = q.address
        let result: any = null;
        const validatorDetail = await (this.stakingValidatorsModel as any).queryDetailByValidator(validatorAddress);
        if (validatorDetail) {
            const moduleName = moduleSlashing;
            const signedBlocksWindow = await (this.parametersModel as any).querySignedBlocksWindow(moduleName);
            const latestBlock = await BlockHttp.queryLatestBlockFromLcd();
            const signedBlocksWindowCurVal = signedBlocksWindow.cur_value || undefined;
            const latestBlockHeight = latestBlock ? latestBlock.block.header.height : 0;
            const startHeight = validatorDetail.start_height || 0;
            if (Number(signedBlocksWindowCurVal) < (Number(latestBlockHeight) - Number(startHeight))) {
                validatorDetail.stats_blocks_window = signedBlocksWindowCurVal;
            } else {
                validatorDetail.stats_blocks_window = (Number(latestBlockHeight) - Number(startHeight));
            }
            if(!validatorDetail.jailed){
                validatorDetail.valStatus = ValidatorNumberStatus[validatorDetail.status]
            }else {
                validatorDetail.valStatus = jailedValidatorLabel
            }
            if (validatorDetail.is_black) {
                validatorDetail.icon = "";
                validatorDetail.description && validatorDetail.description.moniker ? validatorDetail.description.moniker = validatorDetail.moniker_m : '';
            }
            validatorDetail.total_power = await this.getTotalVotingPower()
            validatorDetail.tokens = Number(validatorDetail.tokens)
            validatorDetail.bonded_stake = ((validatorDetail.self_bond && validatorDetail.self_bond.amount ? Number(validatorDetail.self_bond.amount) : 0) * (Number(validatorDetail.tokens) / Number(validatorDetail.delegator_shares))).toString()
            validatorDetail.owner_addr = addressTransform(validatorDetail.operator_address, addressPrefix.iaa)
            result = new ValidatorDetailResDto(validatorDetail)
        }
        return result;
    }

    async getAddressAccount(q: AccountAddrReqDto): Promise<AccountAddrResDto> {
        const address = addressTransform(q.address, addressPrefix.iaa)
        const operatorAddress = addressTransform(q.address, addressPrefix.iva)
        const balancesArray = await this.stakingHttp.queryBalanceByAddress(address)
        const withdrawAddress =  await DistributionHttp.queryWithdrawAddressByDelegator(address)
        const allValidatorsMap = await this.getAllValidatorMonikerMap()
        const allProfilerAddress = await (this.profilerModel as any).queryProfileAddress()
        const validator = allValidatorsMap.get(operatorAddress)
        // const deposits = await (this.txModel as any).queryDepositsAndSubmitByAddress(address)

        const profilerAddressMap = new Map()
        if (allProfilerAddress && allProfilerAddress.length > 0) {
            allProfilerAddress.forEach(item => {
                profilerAddressMap.set(item.address, item)
            })
        }
        const result: any = {}
        result.amount = balancesArray || []
        result.withdrawAddress =  withdrawAddress && withdrawAddress.address
        result.address = address
        result.moniker =  validator && validator.is_black  ? validator.moniker_m : validator && validator.description && validator.description.moniker
        result.icon =  validator && validator.is_black ? "" : validator && validator.icon
        result.operator_address = allValidatorsMap.has(operatorAddress) ? validator.operator_address : ''
        result.isProfiler = profilerAddressMap.size > 0 ? profilerAddressMap.has(address) : false
        if (allValidatorsMap.has(operatorAddress) && !validator.jailed) {
            result.status = ValidatorNumberStatus[validator.status]
        } else {
            result.status = jailedValidatorLabel
        }
        // if (deposits && deposits.data && deposits.data.length > 0) {
            //TODO:zhangjinbiao 处理查询出来与Gov相关的交易列表计算总的amount

        // } else {
            result.deposits = {}
        // }
        return new AccountAddrResDto(result)
    }

    async getDelegatorsDelegations(p:DelegatorsDelegationsParamReqDto,q: DelegatorsDelegationsReqDto): Promise<ListStruct<DelegatorsDelegationsResDto>> {
        const { pageNum, pageSize,useCount } = q
        const { delegatorAddr } = p
        const delegatorsDelegationsFromLcd = await this.stakingHttp.queryDelegatorsDelegationsFromLcd(delegatorAddr,pageNum, pageSize, useCount)
        const dataLcd = delegatorsDelegationsFromLcd ? delegatorsDelegationsFromLcd.result : []
        const count = delegatorsDelegationsFromLcd ? delegatorsDelegationsFromLcd.total : 0;
        const allValidatorsMap = await this.getAllValidatorMonikerMap()
        const resultData = (dataLcd || []).map(item => {
            const validator = allValidatorsMap.get(item.delegation.validator_address);
            return {
                address: item.delegation.validator_address || '',
                moniker: validator && validator.is_black  ? validator.moniker_m : validator && validator.description && validator.description.moniker,
                amount: item.balance || '',
                shares: item.delegation.shares,
                //height: delegatorsDelegationsFromLcd.height || '',
            }
        })
        const result: any = {}
        result.data = DelegatorsDelegationsResDto.bundleData(resultData)
        return new ListStruct(result.data, pageNum, pageSize, count)
    }

    async getDelegatorsUndelegations(p:DelegatorsUndelegationsParamReqDto,q: DelegatorsUndelegationsReqDto): Promise<ListStruct<DelegatorsUndelegationsResDto>> {
        const { pageNum, pageSize,useCount } = q
        const { delegatorAddr } = p
        const delegatorsDelegationsFromLcd = await this.stakingHttp.queryDelegatorsUndelegationsFromLcd(delegatorAddr,pageNum, pageSize, useCount)
        const dataLcd = delegatorsDelegationsFromLcd ? delegatorsDelegationsFromLcd.result : []
        const aminToken = await this.tokensModel.queryMainToken();
        const allValidatorsMap = await this.getAllValidatorMonikerMap()
        let resultData = []
        for (const item of dataLcd) {
            const denom:string = (aminToken || {}).denom || '';
            const entries:any = item && item.entries || []
            if (entries && entries.length > 0) {
                for (const one of entries) {
                    const validator = allValidatorsMap.get(item.validator_address);
                    resultData.push({
                        address: item.validator_address || '',
                        moniker: validator && validator.is_black  ? validator.moniker_m : validator && validator.description && validator.description.moniker,
                        amount: {
                            denom: denom || '',
                            amount: one.balance || ''
                        },
                        height:  one.creation_height ||'',
                        end_time: one.completion_time || '',
                    });
                }
            }
        }
        const count =resultData.length>0 ? resultData.length : 0

        const result: any = {}
        result.data = DelegatorsUndelegationsResDto.bundleData(resultData)
        return new ListStruct(result.data, pageNum, pageSize, count)
    }

    async getValidatorVotesList(p: ValidatorDelegationsReqDto,q: ValidatorDelegationsQueryReqDto): Promise<ListStruct<ValidatorVotesResDto>> {
        const { address } = p;
        const iaaAddress = addressTransform(address, addressPrefix.iaa);
        const votesAll = await (this.txModel as any).queryVoteByAddr(iaaAddress);
        const votes = new Map();
        if (votesAll && votesAll.length > 0) {
            votesAll.forEach(voter => {
                votes.set(voter.msgs[0].msg.proposal_id, voter.tx_hash);
            });
        }
        const votesList = [];
        let count;
        if (votes.size > 0) {
            const hashs = [...votes.values()];
            const votersData = await (this.txModel as any).queryVoteByTxhashs(hashs, q);
            count = votersData.count;
            if (votersData && votersData.data && votersData.data.length > 0) {
                for (const vote of votersData.data) {
                    if (vote.msgs && vote.msgs[0] && vote.msgs[0].msg) {
                        const msg = vote.msgs[0].msg;
                        const proposal = await this.proposalModel.findOneById(msg.proposal_id);
                        if (proposal) {
                            votesList.push({
                                title: proposal.content && proposal.content.title,
                                proposal_id: msg.proposal_id,
                                status: proposal.status,
                                voted: voteOptions[msg.option],
                                tx_hash: vote.tx_hash,
                                proposal_link: !proposal.is_deleted
                            })
                        }
                    }
                }
            }
        }
        const result: any = {};
        result.data = ValidatorVotesResDto.bundleData(votesList);
        return new ListStruct(result.data, q.pageNum, q.pageSize, count);
    }

    async getValidatorDepositsList(p: ValidatorDelegationsReqDto,q: ValidatorDelegationsQueryReqDto): Promise<ListStruct<ValidatorDepositsResDto>> {
        const { address } = p;
        const iaaAddress = addressTransform(address, addressPrefix.iaa);
        const depositsData = await (this.txModel as any).queryDepositsByAddress(iaaAddress, q);
        const depositsList = [];
        const proposalsListFromDb = await this.proposalModel.queryAllProposalsDeletedID();
        const proposalsDeletedId = proposalsListFromDb && proposalsListFromDb.length > 0 ? proposalsListFromDb.map(id => id.id) : [];
        if (depositsData && depositsData.data && depositsData.data.length > 0) {
            for (const depost of depositsData.data) {
                if (depost.msgs && depost.msgs[0] && depost.msgs[0].msg) {
                    const msg = depost.msgs[0].msg;
                    const proposal = await (this.txModel as any).querySubmitProposalById(String(msg.proposal_id));
                    const proposer = proposal && proposal.msgs && proposal.msgs[0] && proposal.msgs[0].msg && proposal.msgs[0].msg.proposer;
                    const ivaProposer = addressTransform(proposer, addressPrefix.iva);
                    const { moniker } = await this.addMonikerAndIva(ivaProposer);
                    depositsList.push({
                        proposal_id: msg.proposal_id,
                        proposer,
                        amount: msg.amount,
                        submited: iaaAddress == proposer,
                        tx_hash: depost.tx_hash,
                        moniker,
                        proposal_link: !proposalsDeletedId.includes(msg.proposal_id)
                    })
                }
            }
        }
        const result: any = {};
        if (q.useCount) {
            result.count = depositsData.count;
        }
        result.data = ValidatorDepositsResDto.bundleData(depositsList);
        return new ListStruct(result.data, q.pageNum, q.pageSize, result.count);
    }

    async addMonikerAndIva(address) {
        const validators = await (this.stakingValidatorsModel as any).queryAllValidators();
        const validatorMap = {};
        validators.forEach((item) => {
            validatorMap[item.operator_address] = item;
        });
        let moniker: string;
        const isValidator = Boolean(validatorMap[address]);
        if (validatorMap[address] &&
            validatorMap[address].description &&
            validatorMap[address].description.moniker) {
            moniker = validatorMap[address].is_black ? validatorMap[address].moniker_m : validatorMap[address].description.moniker
        }
        return {moniker,isValidator};
    }

    async insertBlacks(params: PostBlacksReqDto): Promise<boolean> {
        try {
            const { blacks } = params;
            if (blacks && blacks.length > 0) {
                for (const black of blacks) {
                    const ivaAddr = (black as any).iva_addr || '';
                    const monikerM = (black as any).moniker_m || '';
                    const isBlack = (black as any).is_block === true ? true : false;
                    await (this.stakingValidatorsModel as any).updateBlcakValidator({ivaAddr,monikerM,isBlack})
                }
            }
            return true;
        } catch (e) {
            return false
        }
    }
}

