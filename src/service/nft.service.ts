import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct } from '../api/ApiResult';
import { INft, INftDetailStruct, INftListStruct, INftStruct, INftMapStruct } from '../types/schemaTypes/nft.interface';
import { NftDetailReqDto, NftDetailResDto, NftListReqDto, NftListResDto } from '../dto/nft.dto';
@Injectable()
export class NftService {
    constructor(@InjectModel('Nft') private nftModel: Model<INft>,
                @InjectModel('NftMap') private nftMapModel: any) {
    }

    async queryList(query: NftListReqDto): Promise<ListStruct<NftListResDto[]>> {
        const { pageNum, pageSize, denom, nftId, useCount, owner } = query;
        const nftList: INftListStruct[] = await (this.nftModel as any).findList(pageNum, pageSize, denom, nftId, owner);
        
        const res: NftListResDto[] = [];
        for (let nft of nftList) {
            let denomDetail = (nft.denomDetail as any).length > 0 ? nft.denomDetail[0] : null;
            let denom_name = '';
            let nft_name = '';
            if (nft.denom && nft.denom.length) {
                let nftName:INftMapStruct = await this.nftMapModel.findName(nft.denom, nft.nft_id || '');
                denom_name = nftName ? nftName.denom_name : '';
                nft_name = nftName ? nftName.nft_name : '';
            }
            let result = new NftListResDto(
                nft.denom, 
                nft.nft_id, 
                nft.owner, 
                nft.token_uri, 
                nft.token_data, 
                denomDetail,
                denom_name,
                nft_name);
            res.push(result);
        }
    
        let count: number = 0;
        if (useCount) {
            count = await (this.nftModel as any).findCount(denom, nftId, owner);
        }
        return new ListStruct(res, pageNum, pageSize, count);
    }

    async queryDetail(query: NftDetailReqDto): Promise<NftDetailResDto | null> {
        const { denom, nftId } = query;
        const nft: INftDetailStruct = await (this.nftModel as any).findOneByDenomAndNftId(denom, nftId);
        let nftName:INftMapStruct = await this.nftMapModel.findName(nft.denom, nftId || '');
        if (nft) {
            let denomDetail = (nft.denomDetail as any).length > 0 ? nft.denomDetail[0] : null;
            let denom_name = nftName ? nftName.denom_name : '';
            let nft_name = nftName ? nftName.nft_name : '';
            return new NftDetailResDto(
                nft.denom, 
                nft.nft_id, 
                nft.owner, 
                nft.token_uri, 
                nft.token_data, 
                denomDetail,
                denom_name,
                nft_name);
        } else {
            return null;
        }
    }

    async findListByName(name: string): Promise<INftStruct[]> {
        return await (this.nftModel as any).findListByName(name);
    }

}

