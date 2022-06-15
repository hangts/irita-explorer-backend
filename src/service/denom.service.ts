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
          denomList = await (this.denomModel as any).findList(pageNum, pageSize, denomNameOrId, needAll);
          for (const d of denomList) {
              const retCount = await (this.nftModel as any).queryNftCount(d.denom_id)
              res.push(new DenomListResDto(
                  d.name,
                  d.denom_id,
                  d.tx_hash,
                  retCount,
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

