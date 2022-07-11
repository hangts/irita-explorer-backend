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
        @InjectModel('Statistics') private statisticsModel: any,
    ) {
    }

    async queryList(q: DenomListReqDto): Promise<ListStruct<DenomListResDto[]>> {
        const {pageNum, pageSize, denomNameOrId, useCount, needAll} = q, res: DenomListResDto[] = [];
        let count: number = null, denomList: IDenomStruct[] = [];
        if(pageNum && pageSize || needAll){
          denomList = await this.denomModel.findList(pageNum, pageSize, denomNameOrId, needAll);
          const denomIds = denomList.map(d => d.denom_id);
          const denomIdNftCountMap = new Map<string, number>();
          const denomNftCountDtos = await this.nftModel.groupNftCountByDenomId(denomIds)
          denomNftCountDtos.forEach(x => denomIdNftCountMap.set(x._id, x.nft_count));

           for (const d of denomList) {
             res.push(new DenomListResDto(
                   d.name,
                   d.denom_id,
                   d.tx_hash,
                   denomIdNftCountMap.get(d.denom_id) || 0,
                   d.creator,
                   d.time,
               ))
           }
        }
        if(useCount && !needAll){
            if (!denomNameOrId) {
                //default count with no filter conditions

                const denomCnt = await this.statisticsModel.findStatisticsRecord("denom_all")
                count = denomCnt?.count
            } else {
                count = await (this.denomModel as any).queryDenomCount(denomNameOrId);
            }
        } else if(useCount && needAll){
          count = denomList.length
        }

        return new ListStruct(res, pageNum, pageSize, count);
    }


}

