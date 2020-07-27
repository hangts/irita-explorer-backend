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
        	let denom_name = '';
        	if (d.name && d.name.length) {
        		let denomMap: INftMapStruct = await this.nftMapModel.findName(d.name);
        		denom_name = denomMap ? denomMap.denom_name : '';
        	}
        	res.push(new DenomListResDto(d.name, d.json_schema, d.creator, denom_name));
        }
        return new ListStruct(res, 0, 0, 0);
    }
}

