import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct } from '../api/ApiResult';
import { IDenom, IDenomStruct } from '../types/schemaTypes/denom.interface';
import { DenomListResDto, DenomTxListReqDto, DenomTxListResDto } from '../dto/denom.dto';
import { ITxStruct } from '../types/schemaTypes/tx.interface';

@Injectable()
export class DenomService {
    constructor(
        @InjectModel('Denom') private denomModel: Model<IDenom>,
        @InjectModel('NftMap') private nftMapModel: any,
        @InjectModel('Nft') private nftModel: any,
        @InjectModel('Tx') private txModel: any
    ) {
    }

    async queryList(): Promise<ListStruct<DenomListResDto[]>> {
        const denomList: IDenomStruct[] = await (this.denomModel as any).findList();
        const res: DenomListResDto[] = [];
        for (let d of denomList) {
            res.push(new DenomListResDto(d.name, d.denom_id, d.json_schema, d.creator));
        }
        return new ListStruct(res, 0, 0, 0);
    }

    async queryTxList(q: DenomTxListReqDto): Promise<ListStruct<DenomTxListResDto[]>> {
        const {pageNum, pageSize, denomNameOrId, useCount} = q;
        const denomTxList: ITxStruct[] = await (this.txModel as any).queryDenomTx(pageNum, pageSize, denomNameOrId);
        const res: DenomTxListResDto[] = [];
        for (let d of denomTxList) {
            if(d && d.msgs && d.msgs[0] && (d.msgs[0] as any).msg && (d.msgs[0] as any).msg.id){
                const {name, id, sender} = (d.msgs[0] as any).msg;
                const count = await (this.nftModel as any).queryNftCount((d.msgs[0] as any).msg.id)
                res.push(new DenomTxListResDto(
                    name,
                    id,
                    d.tx_hash,
                    count,
                    sender,
                    d.time,
                ))
            }

        }
        let count: number = 0;
        if(useCount){
            count = await (this.txModel as any).queryDenomTxCount(denomNameOrId);
        }

        return new ListStruct(res, pageNum, pageSize, count);
    }


}

