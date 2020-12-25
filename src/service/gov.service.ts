import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct } from '../api/ApiResult';
import { proposalStatus } from '../constant'
import {
    proposalsReqDto
} from '../dto/gov.dto';
import {
    govProposalResDto
} from '../dto/gov.dto';

@Injectable()
export class GovService {

    constructor(
        @InjectModel('Proposal') private proposalModel: any,
        @InjectModel('ProposalDetail') private proposalDetailModel: any) {}

        async getProposals(q: proposalsReqDto): Promise<ListStruct<govProposalResDto>> {
            const proposalList = await (this.proposalModel as any).queryProposals(q)
            for (const proposal of proposalList.data) {
                if (proposal.status == proposalStatus['PROPOSAL_STATUS_VOTING_PERIOD']) {
                    const proposalsDetail = await this.proposalDetailModel.queryProposalsDetail([proposal.id])
                    console.log('proposalsDetail', proposalsDetail, [proposal.id])
                    if(proposalsDetail && proposalsDetail.length >0) {
                        proposal.tally_details = proposalsDetail[0].tally_details || []
                    }
                }
            }
            let result: any = {}
            result.data = govProposalResDto.bundleData(proposalList.data)
            result.count = proposalList.count
            return new ListStruct(result.data, q.pageNum, q.pageSize, result.count)
        }
}
