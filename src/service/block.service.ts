import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct } from '../api/ApiResult';
import { BaseListVo } from '../vo/base.list.vo';
import { BlockDto } from '../dto/block.dto';
import { IBlockEntities } from '../schema/block.schema';
import { BlockHttp } from '../http/block.http';

@Injectable()
export class BlockService {

    constructor(@InjectModel('Block') private blockModel: Model<IBlockEntities>) {
    }

    async queryBlockList(query: BaseListVo): Promise<ListStruct<BlockDto[]>> {
        const { pageNum, pageSize, useCount } = query;
        let count: number;
        const b: IBlockEntities[] = await (this.blockModel as any).findList(pageNum, pageSize);
        if(useCount){
            count = await (this.blockModel as any).count();
        }
        const resList: BlockDto[] = b.map((b) => {
            return new BlockDto(b.height, b.hash, b.txn, b.time);
        });
        return new ListStruct(resList, pageNum, pageSize, count);
    }

    async queryBlockDetail(p): Promise<BlockDto | null> {
        let data: BlockDto | null = null;
        const res: IBlockEntities | null = await (this.blockModel as any).findOneByHeight(p);
        if (res) {
            data = new BlockDto(res.height, res.hash, res.txn, res.time)
        }
        return data;
    }

    //TODO(lvshenchao) this api has not been used, use any temporary;
    async queryLatestBlock(): Promise<any> {
        try {
            return await this.queryLatestBlockFromLcd();
        } catch (e) {
            console.error('api-error:', e.message);
            return await this.queryLatestBlockFromDB();
        }

    }

    async queryLatestBlockFromDB(): Promise<IBlockEntities> {
        return await (this.blockModel as any).findOneByHeightDesc();
    }

    async queryLatestBlockFromLcd(): Promise<any> {
        return await BlockHttp.queryLatestBlockFromLcd();
    }


}

