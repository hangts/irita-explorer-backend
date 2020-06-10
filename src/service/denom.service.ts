import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct } from '../api/ApiResult';
import { IDenomEntities } from '../schema/denom.schema';
import { DenomListResDto } from '../dto/denom.dto';

@Injectable()
export class DenomService {
    constructor(@InjectModel('Denom') private denomModel: Model<IDenomEntities>) {
    }

    async queryList(): Promise<ListStruct<DenomListResDto[]>> {
        const denomList: any[] = await (this.denomModel as any).findList();
        const res: DenomListResDto[] = denomList.map((d) => {
            return new DenomListResDto(d.name, d.json_schema, d.creator);
        });
        return new ListStruct(res, 0, 0, 0);
    }
}

