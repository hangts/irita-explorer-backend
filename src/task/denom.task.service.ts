import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { DenomHttp } from '../http/lcd/denom.http';
import { IDenom, IDenomMapStruct } from '../types/schemaTypes/denom.interface';
import { getServiceNameFromMsgs } from '../helper/tx.helper';
import { ITxStruct } from '../types/schemaTypes/tx.interface';
import { getTimestamp } from '../util/util';

@Injectable()
export class DenomTaskService {
    constructor(
        @InjectModel('Denom') private denomModel: Model<IDenom>,
        @InjectModel('Tx') private txModel: any,
        private readonly denomHttp: DenomHttp
    ) {
        this.doTask = this.doTask.bind(this);
    }

    async doTask(): Promise<void> {
        const data: any = await this.denomHttp.queryDenomsFromLcd();
        const denomList: IDenomMapStruct[] = [];
        for(let denom of data){
            const res: ITxStruct = await this.txModel.queryTxByDenom(denom.id);
            if(res){
                denomList.push({
                    name:denom.name || '',
                    denomId: denom.id,
                    jsonSchema: denom.schema,
                    creator: denom.creator,
                    height: res.height,
                    txHash: res.tx_hash,
                    createTime: res.time,
                })
            }
        }

        await (this.denomModel as any).saveBulk(denomList);
    }
}

