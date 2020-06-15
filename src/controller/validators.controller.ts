import { Controller, Get, Query} from '@nestjs/common';
import { ValidatorService } from "../service/validator.service"
import { ValidatorsReqDto, ValidatorsResDto } from "../dto/validators.dto"
import { Result } from "../api/ApiResult"
import { ListStruct } from "../api/ApiResult"
import ValidationPipe from '../pipe/validation.pipe';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Validators')
@Controller('validators')
export class ValidatorsController {
    constructor(private readonly validatorsService: ValidatorService) {}
    @Get()
    async getValidators(@Query(new ValidationPipe) query: ValidatorsReqDto): Promise<Result<ListStruct<ValidatorsResDto>>> {
      const data = await this.validatorsService.queryValidators(query)
        return new Result<any>(data)
    }
}
