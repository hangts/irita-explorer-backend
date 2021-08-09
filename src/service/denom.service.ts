import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct } from '../api/ApiResult';
import { IDenom, IDenomStruct } from '../types/schemaTypes/denom.interface';
import { DenomListReqDto, DenomListResDto } from '../dto/denom.dto';

@Injectable()
export class DenomService {
    constructor(
        @InjectModel('Denom') private denomModel: Model<IDenom>,
        @InjectModel('Nft') private nftModel: any,
    ) {
    }

    async queryList(q: DenomListReqDto): Promise<ListStruct<DenomListResDto[]>> {
        const {pageNum, pageSize, denomNameOrId, useCount, needAll} = q;
        let res: DenomListResDto[], count = 0;
        if(pageNum && pageSize){
          const denomList: IDenomStruct[] = await (this.denomModel as any).findList(pageNum, pageSize, denomNameOrId, needAll);
          const res: DenomListResDto[] = [];
          for (const d of denomList) {
              const count = await (this.nftModel as any).queryNftCount(d.denom_id)
              res.push(new DenomListResDto(
                  d.name,
                  d.denom_id,
                  d.tx_hash,
                  count,
                  d.creator,
                  d.time,
              ))
          }
        }
        if(useCount && !needAll){
            count = await (this.denomModel as any).queryDenomCount(denomNameOrId);
        }

        return new ListStruct(res, pageNum, pageSize, count);
    }


}

