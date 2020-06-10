import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct } from '../api/ApiResult';
import { IDenomEntities } from '../schema/denom.schema';
import { DenomHttp } from '../http/denom.http';
import { DenomListResDto } from '../dto/denom.dto';

@Injectable()
export class DenomService {
    constructor(@InjectModel('Denom') private denomModel: Model<IDenomEntities>, private readonly denomHttp: DenomHttp) {
        this.doTask = this.doTask.bind(this);
    }

    async queryList(): Promise<ListStruct<DenomListResDto[]>> {
        const denomList: any[] = await (this.denomModel as any).findList();
        const res: DenomListResDto[] = denomList.map((d) => {
            return new DenomListResDto(d.name, d.json_schema, d.creator, d.update_time, d.create_time);
        });
        return new ListStruct(res, 0, 0, 0);
    }


    async doTask(): Promise<any> {
        try {
            const data: any = await this.denomHttp.queryDenomsFromLcd();
            return await (this.denomModel as any).saveBulk(data);
        } catch (e) {
            new Logger().error('api-error:', e.message);
            return true;// release lock;
        }

    }
}

