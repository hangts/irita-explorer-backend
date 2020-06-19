import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct } from '../api/ApiResult';
import { BlockListResDto, BlockListReqDto, BlockDetailReqDto } from '../dto/block.dto';
import { IBlock, IBlockStruct } from '../types/schemaTypes/block.interface';
import { BlockHttp } from '../http/lcd/block.http';

@Injectable()
export class BlockService {

    constructor(@InjectModel('Block') private blockModel: Model<IBlock>) {
    }

    async queryBlockList(query: BlockListReqDto): Promise<ListStruct<BlockListResDto[]>> {
        const { pageNum, pageSize, useCount } = query;
        let count: number;
        const b: IBlockStruct[] = await (this.blockModel as any).findList(pageNum, pageSize);
        if (useCount) {
            count = await (this.blockModel as any).findCount();
        }
        const res: BlockListResDto[] = b.map((b) => {
            return new BlockListResDto(b.height, b.hash, b.txn, b.time);
        });
        return new ListStruct(res, pageNum, pageSize, count);
    }

    async queryBlockDetail(p: BlockDetailReqDto): Promise<BlockListResDto | null> {
        let data: BlockListResDto | null = null;
        const { height } = p;
        const res: IBlockStruct | null = await (this.blockModel as any).findOneByHeight(height);
        if (res) {
            data = new BlockListResDto(res.height, res.hash, res.txn, res.time);
        }
        return data;
    }

    async queryLatestBlock(): Promise<IBlockStruct> {
        try {
            const blockStruct: IBlockStruct = await this.queryLatestBlockFromLcd();;
            if(blockStruct){
                return blockStruct;
            }else {
                return await this.queryLatestBlockFromDB();
            }
        } catch (e) {
            console.error('api-error:', e.message);
            return await this.queryLatestBlockFromDB();
        }

    }

    private async queryLatestBlockFromDB(): Promise<IBlockStruct> {
        return await (this.blockModel as any).findOneByHeightDesc();
    }

    private async queryLatestBlockFromLcd(): Promise<IBlockStruct> {
        const res = await BlockHttp.queryLatestBlockFromLcd();
        const blockStruct: IBlockStruct = {};
        if(res && res.block_id && res.block && res.block.header && res.block.data){
            blockStruct.height = res.block.header.height;
            blockStruct.time = res.block.header.time;
            blockStruct.txn = res.block.data.txs ? res.block.data.txs.length : 0;
            blockStruct.hash = res.block_id.hash;
        }
        return blockStruct;
    }


}

