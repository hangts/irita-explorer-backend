import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
} from '@nestjs/common';
import {ApiError} from '../api/ApiResult';
import {ErrorCodes} from '../api/ResultCodes';
import {ResultCodesMaps} from '../api/ResultCodes';

@Injectable()
// transform pipe, which can transform page number and page size into type of Number;
export class BlockDetailValidationPipe implements PipeTransform<any> {
    async transform(value: any, { type, metatype }: ArgumentMetadata) {
        if(!value.height){
            throw new ApiError(ErrorCodes.failed, 'height is missed');
        }else {
            let data: object = Object.assign({},value);
            if(typeof Number(value.height) !== 'number'){
                throw new ApiError(ErrorCodes.InvalidRequest, ResultCodesMaps.get(ErrorCodes.InvalidRequest));
            }else{
                (data as any).height = Number(value.height);
            }
            return data;
        }
    }
}


