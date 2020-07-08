import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct } from '../api/ApiResult';
import { IDenom, IDenomStruct } from '../types/schemaTypes/denom.interface';
import { DenomListResDto } from '../dto/denom.dto';

@Injectable()
export class DenomService {
    constructor(@InjectModel('Denom') private denomModel: Model<IDenom>) {
    }

    async queryList(): Promise<ListStruct<DenomListResDto[]>> {
        const denomList: IDenomStruct[] = await (this.denomModel as any).findList();
        const res: DenomListResDto[] = denomList.map((d) => {
            return new DenomListResDto(d.name, d.json_schema, d.creator);
        });
        return new ListStruct(res, 0, 0, 0);
    }
}

