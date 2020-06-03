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

	static getDisplayData(value:any):any{
		return value;
	}
}

//base Paging request Dto
export class PagingDto extends BaseReqDto{
	
	@IsOptional()
  pageNumber: string;

  @IsOptional()
  pageSize: string;

  @IsOptional()
  useCount: string;

  static validate(value:any):void{
  	if (value.pageNumber && Number(value.pageNumber) < 1) {
  		throw new ApiError(ErrorCodes.InvalidParameter, 'The pageNumber must be greater than 0');
  	}
  	if (value.pageSize && Number(value.pageSize) < 1) {
  		throw new ApiError(ErrorCodes.InvalidParameter, 'The pageSize must be greater than 0');
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