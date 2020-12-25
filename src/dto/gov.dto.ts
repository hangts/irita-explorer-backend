import { BaseReqDto, PagingReqDto,BaseResDto } from './base.dto';
import { ApiError } from '../api/ApiResult';
import { ErrorCodes } from '../api/ResultCodes';
import { ApiProperty,ApiPropertyOptional } from '@nestjs/swagger';

/***************Req***********************/

export class proposalsReqDto extends PagingReqDto { 
    
}


/***************Res*************************/

export class govProposalResDto extends BaseResDto {
    id: string;
    content: object;
    status: string;
    final_tally_result: object;
    current_tally_result: object;
    tally_details: any;
    submit_time: number;
    deposit_end_time: number;
    total_deposit: object;
    initial_deposit: object;
    voting_end_time: number;
    quorum: string;
    threshold: string;
    veto_threshold: string;

    constructor(proposal) {
        super();
        this.id = proposal.id || '';
        this.content = proposal.content || {};
        this.status = proposal.status || '';
        this.final_tally_result = proposal.final_tally_result || {};
        this.current_tally_result = proposal.current_tally_result || {};
        this.tally_details = proposal.tally_details || [];
        this.submit_time = proposal.submit_time || {};
        this.deposit_end_time = proposal.deposit_end_time || 0;
        this.total_deposit = proposal.total_deposit || {};
        this.initial_deposit = proposal.initial_deposit || {};
        this.voting_end_time = proposal.voting_end_time || 0;
        this.quorum = proposal.quorum || '';
        this.threshold = proposal.threshold || '';
        this.veto_threshold = proposal.veto_threshold || '';
    }

    static bundleData(value: any): govProposalResDto[] {
        let data: govProposalResDto[] = [];
        data = value.map((v: any) => {
            return new govProposalResDto(v);
        });
        return data;
    }
}