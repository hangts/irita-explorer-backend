import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct } from '../api/ApiResult';
import { INft,INftStruct, INftMapStruct } from '../types/schemaTypes/nft.interface';
import { NftDetailReqDto, NftDetailResDto, NftListReqDto, NftListResDto } from '../dto/nft.dto';
import { IDenom, IDenomStruct } from '../types/schemaTypes/denom.interface';
@Injectable()
export class NftService {
    constructor(
        @InjectModel('Nft') private nftModel: Model<INft>,
        @InjectModel('Denom') private denomModel: Model<IDenom>,
        @InjectModel('Statistics') private statisticsModel: any,) {
    }

    async queryList(query: NftListReqDto): Promise<ListStruct<NftListResDto[]>> {
        const { pageNum, pageSize, denomId, nftId, useCount, owner, sort } = query, res: NftListResDto[] = [];
        let nftData, count = null;
        if(pageNum && pageSize){
          nftData = await (this.nftModel as any).findList(pageNum, pageSize, denomId, nftId, owner, sort);
          if (nftData?.data.length === 0){
                return new ListStruct(res, pageNum, pageSize, count);
          }

          const denomIds:string[] = Array.from(new Set(nftData.data.map(x => x.denom_id)));
          const denoms:IDenomStruct[] = await (this.denomModel as any).findAllInDenomID(denomIds);
          const denomIdNameMap = new Map<string, string>();
          denoms.forEach(d => denomIdNameMap.set(d.denom_id,d.name))

          for (const nft of nftData.data) {
              // let denomDetail = nft.denomDetail&&(nft.denomDetail as any).length > 0 ? nft.denomDetail[0] : null;
              const result = new NftListResDto(
                  nft.denom_id,
                  nft.nft_id,
                  nft.owner,
                  nft.uri,
                  nft.data,
                  null,
                  denomIdNameMap.get(nft.denom_id)||"",
                  nft.nft_name,
                  nft.last_block_time,
                  nft.create_time,
              );
              res.push(result);
          }
        }
        if(useCount){
            if (!denomId && !nftId && !owner) {
                //default count with no filter conditions

                const nftCnt = await this.statisticsModel.findStatisticsRecord("nft_all")
                count = nftCnt?.count
            } else {
                count = await (this.nftModel as any).findListCount(denomId, nftId, owner);
            }
        }

        return new ListStruct(res, pageNum, pageSize, count);
    }

    // nfts/details
    async queryDetail(query: NftDetailReqDto): Promise<NftDetailResDto | null> {
        const { denomId, nftId } = query;
        const nft: INftStruct = await (this.nftModel as any).findOneByDenomAndNftId(denomId, nftId);
        const denomDetail:IDenomStruct = await (this.denomModel as any).findOneByDenomAndNftIdFromDenom(denomId);
        if (nft) {
            return new NftDetailResDto(
                nft.denom_id,
                nft.nft_id,
                nft.owner,
                nft.uri,
                nft.data,
                denomDetail,
                denomDetail.name,
                nft.nft_name,
                nft.last_block_time,
            );
        } else {
            return null;
        }
    }

    // async findListByName(name: string): Promise<INftStruct[]> {
    //     return await (this.nftModel as any).findListByName(name);
    // }

}

