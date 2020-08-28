import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { DenomHttp } from '../http/lcd/denom.http';
import { IDenom, IDenomMapStruct, IDenomStruct } from '../types/schemaTypes/denom.interface';
import { ITxStruct } from '../types/schemaTypes/tx.interface';

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
        for(let denom of data){
            const res: ITxStruct = await this.txModel.queryTxByDenom(denom.id);
            const denomFromDb: IDenomStruct = await (this.denomModel as any).findOneByDenomId(denom.id);
            const d: IDenomMapStruct = {
                name:denom.name || '',
                denomId: denom.id,
                jsonSchema: denom.schema,
                creator: denom.creator,
                height: res ? res.height : 0,
                txHash: res ? res.tx_hash : '',
                createTime: res ? res.time : 0,
            };
            if(denomFromDb){
                if(res
                    && res.height
                    && res.tx_hash
                    && res.time
                    && res.height !== denomFromDb.height
                    && res.tx_hash !== denomFromDb.tx_hash
                    && res.time !== denomFromDb.time
                ){
                    await (this.denomModel as any).updateDenom(d);
                }
            }else{
                await (this.denomModel as any).saveDenom(d);
            }
        }


    }
}

