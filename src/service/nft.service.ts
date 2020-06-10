import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct } from '../api/ApiResult';
import { INftEntities} from '../types/nft.interface';
import { IDenomEntities} from '../types/denom.interface';
import { NftDetailReqDto, NftDetailResDto, NftListReqDto, NftListResDto } from '../dto/nft.dto';

@Injectable()
export class NftService {
    constructor(@InjectModel('Nft') private nftModel: Model<INftEntities>,
        @InjectModel('Denom') private denomModel: Model<IDenomEntities>,
    ) {
    }

    async queryList(query: NftListReqDto): Promise<ListStruct<NftListResDto[]>> {
        const { pageNum, pageSize, denom, nftId, useCount } = query;
        const nftList: any[] = await (this.nftModel as any).findList(pageNum, pageSize, denom, nftId);
        const res: NftListResDto[] = nftList.map((n) => {
            return new NftListResDto(n.denom, n.nft_id, n.owner, n.token_uri, n.token_data);
        });
        let count: number = 0;
        if (useCount) {
            count = await (this.nftModel as any).queryCount();
        }
        return new ListStruct(res, pageNum, pageSize, count);
    }

    async queryDetail(query: NftDetailReqDto): Promise<NftDetailResDto | null> {
        const { denom, nftId } = query;
        const n: any = await (this.nftModel as any).findOneByDenomAndNftId(denom, nftId);
        if (n) {
            return new NftListResDto(n.denom, n.nft_id, n.owner, n.token_uri, n.token_data);
        } else {
            return null;
        }
    }

    async findNftListByName(name: string): Promise<INftEntities[]> {
        return await (this.nftModel as any).findNftListByName(name);
    }

}

