import {IsString, IsInt, Length, Min, Max, IsOptional, Equals, MinLength, ArrayNotEmpty} from 'class-validator';
import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {BaseReqDto, BaseResDto, PagingReqDto} from './base.dto';
import {ApiError} from '../api/ApiResult';
import {ErrorCodes} from '../api/ResultCodes';
import {IBindTx} from '../types/tx.interface';

/************************   request dto   ***************************/


/************************   response dto   ***************************/
//txs response dto
export class NetworkResDto extends BaseResDto{
    network_id:string;
    network_name:string;
    uri:string;

    constructor(value) {
        super();
        const { network_id, network_name, uri } = value;
        this.network_id = network_id;
        this.network_name = network_name;
        this.uri = uri;
    }

    static bundleData(value: any): NetworkResDto[] {
        let data: NetworkResDto[] = [];
        data = value.map((v: any) => {
            return new NetworkResDto(v);
        });
        return data;
    }
}


