import { IsString, IsInt, Length , IsOptional} from 'class-validator';

export class BaseDot {
	
	static validate(value:any){
		
	}

	static convert(value:any){

	}

	static getDisplayData(value:any){
		return value;
	}
}

export class PagingDot extends BaseDot{
	
	@IsOptional()
  pageNumber: string;

  @IsOptional()
  pageSize: string;

  @IsOptional()
  useCount: string;
}