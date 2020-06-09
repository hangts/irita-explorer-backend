import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct } from '../api/ApiResult';
import { BlockListResDto, BlockListReqDto, BlockDetailReqDto } from '../dto/block.dto';
import { IBlockEntities } from '../schema/block.schema';
import { BlockHttp } from '../http/block.http';

@Injectable()
export class BlockService {

    constructor(@InjectModel('Block') private blockModel: Model<IBlockEntities>) {
    }

    async queryBlockList(query: BlockListReqDto): Promise<ListStruct<BlockListResDto[]>> {
        const { pageNum, pageSize, useCount } = query;
        let count: number;
        const b: IBlockEntities[] = await (this.blockModel as any).findBlockList(pageNum, pageSize);
        if(useCount){
            count = await (this.blockModel as any).count();
        }
        const res: BlockListResDto[] = b.map((b) => {
            return new BlockListResDto(b.height, b.hash, b.txn, b.time);
        });
        return new ListStruct(res, pageNum, pageSize, count);
    }

    async queryBlockDetail(p: BlockDetailReqDto): Promise<BlockListResDto | null> {
        let data: BlockListResDto | null = null;
        const {height} = p;
        const res: IBlockEntities | null = await (this.blockModel as any).findOneByHeight(height);
        if (res) {
            data = new BlockListResDto(res.height, res.hash, res.txn, res.time)
        }
        return data;
    }

    //TODO(lsc) this api has not been used, use any temporary;
    async queryLatestBlock(): Promise<any> {
        try {
            return await this.queryLatestBlockFromLcd();
        } catch (e) {
            console.error('api-error:', e.message);
            return await this.queryLatestBlockFromDB();
        }

    }

    private async queryLatestBlockFromDB(): Promise<IBlockEntities> {
        return await (this.blockModel as any).findOneByHeightDesc();
    }

    private async queryLatestBlockFromLcd(): Promise<any> {
        return await BlockHttp.queryLatestBlockFromLcd();
    }


}

