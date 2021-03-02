import { BaseReqDto, PagingReqDto, BaseResDto } from './base.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Coin } from './common.res.dto';

/***************Req***********************/
export class genesisAccountsReqDto {
    @ApiProperty({description: 'type: IRIS/COSMOS'})
    chain?: string;
}

/***************Res*************************/
