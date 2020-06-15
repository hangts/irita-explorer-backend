import { BaseResDto,PagingReqDto} from './base.dto';
import { ApiError } from '../api/ApiResult';
import { ErrorCodes} from '../api/ResultCodes';
export class ValidatorsReqDto extends PagingReqDto{
  pageNum: number ;
  pageSize: number;
  jailed: boolean | string
    static validate (value:any){
      super.validate(value)
      if(value.jailed && value.jailed !== true || value.jailed !== false){
        throw new ApiError(ErrorCodes.InvalidRequest,"jailed must be true or false")
      }
    }
}
export class ValidatorsResDto extends BaseResDto {
  name: String
  pubkey: String
  power: String
  jailed: Boolean|String
  operator: String
  constructor(validatorsData) {
    super();
    //validatorsData 数据库查询出来的结果
    //定义返回结果的字段名称，处理返回结果
    this.name = validatorsData.name;
    this.pubkey = validatorsData.pubkey;
    this.operator = validatorsData.operator;
    this.power = validatorsData.power;
    this.jailed = validatorsData.jailed;
  }
  static bundleData(validatorData:any){
    let data: Array<any> = [];
    data = validatorData.map((item: any) => {
      return new ValidatorsResDto(item)
    })
    return data
  }
}
