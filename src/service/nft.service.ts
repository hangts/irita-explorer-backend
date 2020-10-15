import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct } from '../api/ApiResult';
import { INft, INftDetailStruct, INftListStruct, INftStruct, INftMapStruct } from '../types/schemaTypes/nft.interface';
import { NftDetailReqDto, NftDetailResDto, NftListReqDto, NftListResDto } from '../dto/nft.dto';
@Injectable()
export class NftService {
    constructor(@InjectModel('Nft') private nftModel: Model<INft>) {
    }

    async queryList(query: NftListReqDto): Promise<ListStruct<NftListResDto[]>> {
        const { pageNum, pageSize, denomId, nftId, useCount, owner } = query;
        const nftData = await (this.nftModel as any).findList(pageNum, pageSize, denomId, nftId, owner, useCount);
        const res: NftListResDto[] = [];
        for (let nft of nftData.data) {
            let denomDetail = (nft.denomDetail as any).length > 0 ? nft.denomDetail[0] : null;
            let result = new NftListResDto(
                nft.denom_id,
                nft.nft_id, 
                nft.owner, 
                nft.uri, 
                nft.data, 
                denomDetail,
                nft.denom_name,
                nft.nft_name);
            res.push(result);
        }
        return new ListStruct(res, pageNum, pageSize, nftData.count);
    }

    async queryDetail(query: NftDetailReqDto): Promise<NftDetailResDto | null> {
        const { denomId, nftId } = query;
        const nft: INftDetailStruct = await (this.nftModel as any).findOneByDenomAndNftId(denomId, nftId);
        if (nft) {
            let denomDetail = (nft.denomDetail as any).length > 0 ? nft.denomDetail[0] : null;
            return new NftDetailResDto(
                nft.denom_id,
                nft.nft_id, 
                nft.owner, 
                nft.uri, 
                nft.data, 
                denomDetail,
                nft.denom_name,
                nft.nft_name);
        } else {
            return null;
        }
    }

    async findListByName(name: string): Promise<INftStruct[]> {
        return await (this.nftModel as any).findListByName(name);
    }

}

