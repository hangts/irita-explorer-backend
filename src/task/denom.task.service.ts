import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { DenomHttp } from '../http/lcd/denom.http';
import { IDenomEntities } from '../types/denom.interface';

@Injectable()
export class DenomTaskService {
    constructor(@InjectModel('Denom') private denomModel: Model<IDenomEntities>, private readonly denomHttp: DenomHttp) {
        this.doTask = this.doTask.bind(this);
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

