import {IsOptional} from 'class-validator';
import {ApiError} from '../api/ApiResult';
import {ErrorCodes} from '../api/ResultCodes';
import constant from '../constant/constant';

//base request dto
export class BaseReqDto {
	
	static validate(value:any):void{

	}

	static convert(value:any):any{
		return value;
	}
}

// base response dto
export class BaseResDto {

	static bundleData(value:any):any{
		return value;
	}
}

//base Paging request Dto
export class PagingReqDto extends BaseReqDto{
	
	@IsOptional()
  pageNumber?: string;

  @IsOptional()
  pageSize?: string;

  @IsOptional()
  useCount?: string;

  static validate(value:any):void{
  	let patt = /^[1-9]\d*$/;
  	if (value.pageNumber && (!patt.test(value.pageNumber) || value.pageNumber < 1)) {
  		throw new ApiError(ErrorCodes.InvalidParameter, 'The pageNumber must be a positive integer greater than 0');
  	}
  	if (value.pageSize && (!patt.test(value.pageSize) || value.pageNumber < 1)) {
  		throw new ApiError(ErrorCodes.InvalidParameter, 'The pageSize must be a positive integer greater than 0');
  	}
	}

  static convert(value:any):any{
	  	if (!value.pageNumber) {
				value.pageNumber = constant.defaultPaging.pageNumber;
			}
			if (!value.pageSize) {
				value.pageSize = constant.defaultPaging.pageSize;
			}
		return value;
	}
}