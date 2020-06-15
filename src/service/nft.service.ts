import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct } from '../api/ApiResult';
import { INft, INftDetailStruct, INftListStruct, INftStruct } from '../types/schemaTypes/nft.interface';
import { NftDetailReqDto, NftDetailResDto, NftListReqDto, NftListResDto } from '../dto/nft.dto';

@Injectable()
export class NftService {
    constructor(@InjectModel('Nft') private nftModel: Model<INft>) {
    }

    async queryList(query: NftListReqDto): Promise<ListStruct<NftListResDto[]>> {
        const { pageNum, pageSize, denom, nftId, useCount, owner } = query;
        const nftList: INftListStruct[] = await (this.nftModel as any).findList(pageNum, pageSize, denom, nftId, owner);
        const res: NftListResDto[] = nftList.map((nft) => {
            let denomDetail = (nft.denomDetail as any).length > 0 ? nft.denomDetail[0] : null;
            return new NftListResDto(nft.denom, nft.nft_id, nft.owner, nft.token_uri, nft.token_data, denomDetail);
        });
        let count: number = 0;
        if (useCount) {
            count = await (this.nftModel as any).findCount();
        }
        return new ListStruct(res, pageNum, pageSize, count);
    }

    async queryDetail(query: NftDetailReqDto): Promise<NftDetailResDto | null> {
        const { denom, nftId } = query;
        const nft: INftDetailStruct = await (this.nftModel as any).findOneByDenomAndNftId(denom, nftId);
        if (nft) {
            let denomDetail = (nft.denomDetail as any).length > 0 ? nft.denomDetail[0] : null;
            return new NftDetailResDto(nft.denom, nft.nft_id, nft.owner, nft.token_uri, nft.token_data, denomDetail);
        } else {
            return null;
        }
    }

    async findListByName(name: string): Promise<INftStruct[]> {
        return await (this.nftModel as any).findListByName(name);
    }

}

