import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct } from '../api/ApiResult';
import { IDenom, IDenomStruct } from '../types/schemaTypes/denom.interface';
import { INftMapStruct } from '../types/schemaTypes/nft.interface';
import { DenomListResDto } from '../dto/denom.dto';

@Injectable()
export class DenomService {
    constructor(@InjectModel('Denom') private denomModel: Model<IDenom>,
    						@InjectModel('NftMap') private nftMapModel: any) {
    }

    async queryList(): Promise<ListStruct<DenomListResDto[]>> {
        const denomList: IDenomStruct[] = await (this.denomModel as any).findList();
        const res: DenomListResDto[] = [];
        for (let d of denomList) {
        	res.push(new DenomListResDto(d.name,d.denom_id, d.json_schema, d.creator));
        }
        return new ListStruct(res, 0, 0, 0);
    }
}

