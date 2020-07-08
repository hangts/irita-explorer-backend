import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { DenomHttp } from '../http/lcd/denom.http';
import { IDenom } from '../types/schemaTypes/denom.interface';

@Injectable()
export class DenomTaskService {
    constructor(@InjectModel('Denom') private denomModel: Model<IDenom>, private readonly denomHttp: DenomHttp) {
        this.doTask = this.doTask.bind(this);
    }

    async doTask(): Promise<void> {
        const data: any = await this.denomHttp.queryDenomsFromLcd();
        await (this.denomModel as any).saveBulk(data);
    }
}

