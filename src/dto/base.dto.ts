import {IsOptional} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {ApiError} from '../api/ApiResult';
import {ErrorCodes} from '../api/ResultCodes';
import { DefaultPaging } from '../constant';
//base request dto
export class BaseReqDto {

    static validate(value: any): void {

    }

    static convert(value: any): any {
        return value;
    }
}

// base response dto
export class BaseResDto {

    static bundleData(value: any): any {
        return value;
    }
}

export class DeepPagingReqDto extends BaseReqDto {
  @ApiPropertyOptional({description : 'The pageNum must be a positive integer greater than 0'})
  pageNum?: number;

  @ApiPropertyOptional({description : 'The pageSize must be a positive integer greater than 0'})
  pageSize?: number;

  @ApiPropertyOptional({description:'true/false'})
  useCount?: boolean;

  static validate(value: any): void {
      const patt = /^[1-9]\d*$/;
      if (value.pageNum && (!patt.test(value.pageNum) || value.pageNum < 1)) {
          throw new ApiError(ErrorCodes.InvalidParameter, 'The pageNum must be a positive integer greater than 0');
      }
      if (value.pageSize && (!patt.test(value.pageSize) || value.pageNum < 1)) {
          throw new ApiError(ErrorCodes.InvalidParameter, 'The pageSize must be a positive integer greater than 0');
      }
  }

  static convert(value: any): any {
      if(!value.useCount){
          value.useCount = false;
      }else {
          if(value.useCount === 'true'){
              value.useCount = true;
          }else {
              value.useCount = false;
          }
      }
      value.pageNum = value.pageNum && Number(value.pageNum);
      value.pageSize = value.pageSize && Number(value.pageSize);
      return value;
  }

}

//base Paging request Dto
export class PagingReqDto extends BaseReqDto {

    @ApiPropertyOptional()
    @IsOptional()
    pageNum?: number;

    @ApiPropertyOptional()
    @IsOptional()
    pageSize?: number;

    @ApiPropertyOptional({description:'true/false'})
    @IsOptional()
    useCount?: boolean;

    static validate(value: any): void {
        let patt = /^[1-9]\d*$/;
        if (value.pageNum && (!patt.test(value.pageNum) || value.pageNum < 1)) {
            throw new ApiError(ErrorCodes.InvalidParameter, 'The pageNum must be a positive integer greater than 0');
        }
        if (value.pageSize && (!patt.test(value.pageSize) || value.pageNum < 1)) {
            throw new ApiError(ErrorCodes.InvalidParameter, 'The pageSize must be a positive integer greater than 0');
        }
    }

    static convert(value: any): any {
        if (!value.pageNum) {
            value.pageNum = DefaultPaging.pageNum;
        }
        if (!value.pageSize) {
            value.pageSize = DefaultPaging.pageSize;
        }
        if(!value.useCount){
            value.useCount = false;
        }else {
            if(value.useCount === 'true'){
                value.useCount = true;
            }else {
                value.useCount = false;
            }
        }
        value.pageNum = Number(value.pageNum);
        value.pageSize = Number(value.pageSize);
        return value;
    }
}