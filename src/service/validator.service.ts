import { Injectable , HttpServer} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ValidatorsReqDto,ValidatorsResDto } from '../dto/validators.dto';
import { ListStruct } from "../api/ApiResult";

@Injectable()
 export class ValidatorService {
    constructor(@InjectModel('Validators') private validatorModel: any) {
    }
    async queryValidators(query: ValidatorsReqDto): Promise<ListStruct<ValidatorsResDto[]>> {
      let validatorsData = await this.validatorModel.findValidators(query)
      return new ListStruct(ValidatorsResDto.bundleData(validatorsData.data), query.pageNum, query.pageSize, validatorsData.count);
    }
}
