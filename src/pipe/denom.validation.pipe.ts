import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ErrorCodes } from '../api/ResultCodes';
import {ApiError} from '../api/ApiResult';

@Injectable()
export class DenomValidationPipe implements PipeTransform<any> {
    async transform(value: any, { metatype }: ArgumentMetadata) {
        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }
        const object = plainToClass(metatype, value);
        const errors = await validate(object);
        if (errors.length > 0) {
            const errMsg: string = Object.values(errors[0].constraints)[0];
            throw new ApiError(ErrorCodes.failed,errMsg);
        }
        return value;
    }

    private toValidate(metatype: Function): boolean {
        const types: Function[] = [String, Boolean, Number, Array, Object];
        return !types.includes(metatype);
    }
}
