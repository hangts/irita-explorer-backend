import { Controller, Get, Query} from '@nestjs/common';
import { ValidatorsService } from "../service/validator.service"
import { ValidatorsReqDto, ValidatorsResDto } from "../dto/validators.dto"
import { Result } from "../api/ApiResult"
import { ListStruct } from "../api/ApiResult"
import { ValidationPipe } from "../pipe/validators.pipe"
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Validators')
@Controller('validators')
export class ValidatorsController {
    constructor(private readonly validatorsService: ValidatorsService) {}
    @Get()
    async getValidators(@Query(new ValidationPipe) query: ValidatorsReqDto): Promise<Result<ListStruct<ValidatorsResDto>>> {
      const data = await this.validatorsService.queryValidators(query)
        return new Result<any>(data)
    }
}
