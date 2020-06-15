import { Injectable , HttpServer} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ValidatorsReqDto,ValidatorsResDto } from '../dto/validators.dto';
import { ListStruct } from "../api/ApiResult";

@Injectable()
 export class ValidatorsService {
    constructor(@InjectModel('validators') private validatorsModel: any) {
    }
    async queryValidators(query: ValidatorsReqDto): Promise<ListStruct<ValidatorsResDto[]>> {
      let validatorsData = await this.validatorsModel.findValidators(query)
      return new ListStruct(ValidatorsResDto.bundleData(validatorsData.data), Number(query.pageNum), Number(query.pageSize), validatorsData.count);
    }
}
