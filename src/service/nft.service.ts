import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct } from '../api/ApiResult';
import { INft, INftStruct } from '../types/nft.interface';
import { NftDetailReqDto, NftDetailResDto, NftListReqDto, NftListResDto } from '../dto/nft.dto';

@Injectable()
export class NftService {
    constructor(@InjectModel('Nft') private nftModel: Model<INft>) {
    }

    async queryList(query: NftListReqDto): Promise<ListStruct<NftListResDto[]>> {
        const { pageNum, pageSize, denom, nftId, useCount } = query;
        const nftList: INftStruct[] = await (this.nftModel as any).findList(pageNum, pageSize, denom, nftId);
        const res: NftListResDto[] = nftList.map((n) => {
            return new NftListResDto(n.denom, n.nft_id, n.owner, n.token_uri, n.token_data);
        });
        let count: number = 0;
        if (useCount) {
            count = await (this.nftModel as any).findCount();
        }
        return new ListStruct(res, pageNum, pageSize, count);
    }

    async queryDetail(query: NftDetailReqDto): Promise<NftDetailResDto | null> {
        const { denom, nftId } = query;
        const nft: INftStruct = await (this.nftModel as any).findOneByDenomAndNftId(denom, nftId);
        if (nft) {
            return new NftListResDto(nft.denom, nft.nft_id, nft.owner, nft.token_uri, nft.token_data);
        } else {
            return null;
        }
    }

    async findListByName(name: string): Promise<INftStruct[]> {
        return await (this.nftModel as any).findListByName(name);
    }

}

