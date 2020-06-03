import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct } from '../api/ApiResult';
import { BaseListVo } from '../vo/base.list.vo';
import { BlockDto } from '../dto/block.dto';
import { IBlockEntities } from '../schema/block.schema';

@Injectable()
export class BlockService {
    constructor(@InjectModel('Block') private blockModel: Model<IBlockEntities>) {
    }

    async queryBlockList(query: BaseListVo): Promise<ListStruct<BlockDto[]>> {
        const { pageNumber, pageSize, useCount } = query;
        let count: number;
        const b: IBlockEntities[] = await (this.blockModel as any).findList(query);
        if(useCount){
            count = await (this.blockModel as any).count();
        }
        const resList: BlockDto[] = b.map((b) => {
            return {
                height: b.height,
                txn: b.txn,
                hash: b.hash,
                time: b.time,
            };
        });
        return new ListStruct(resList, pageNumber, pageSize, count);
    }

    async queryBlockDetail(p): Promise<BlockDto | null> {
        let data: BlockDto | null = null;
        const res: IBlockEntities | null = await (this.blockModel as any).findOneByHeight(p);
        if (res) {
            data = {
                height: res.height,
                txn: res.txn,
                hash: res.hash,
                time: res.time,
            };
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
        return await (this.blockModel as any).queryLatestBlockFromLcd();
    }


}

