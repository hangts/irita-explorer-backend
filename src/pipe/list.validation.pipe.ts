import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
} from '@nestjs/common';

@Injectable()
// transform pipe, which can transform page number and page size into type of Number;
export class ListValidationPipe implements PipeTransform<any> {
    async transform(value: any, { type, metatype }: ArgumentMetadata) {
        let res = Object.assign({}, value);
        res.pageNumber = value.pageNumber ? Number(value.pageNumber) : 1;
        res.pageSize = value.pageSize ? Number(value.pageSize) : 10;
        res.useCount = (value.useCount === true || value.useCount === 'true');
        return res;
    }
}


