import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IDenomQueryParams } from '../types/denom.interface';
import { ListStruct } from '../api/ApiResult';
import { IDenom } from '../types/denom.interface';
import { CreateDenomDto } from '../dto/create.denom.dto';

@Injectable()
export class DenomService {
    constructor(@InjectModel('Denom') private denomModel: Model<IDenom>) {
    }

    async queryDenomList(query: IDenomQueryParams): Promise<ListStruct<any[]>> {
        const { pageNum, pageSize } = query;
        const denomList: any[] = await this.denomModel.find().skip(Number(pageNum)).limit(Number(pageSize)).exec();
        return new ListStruct(denomList, Number(pageNum), Number(pageSize), 0);
    }

    async createDenom(data: CreateDenomDto): Promise<CreateDenomDto>{
        return  {
            height: 100,
            hash: 'hello world',
            memo: '红豆生南国',
        };
    }
}

interface A{}
interface C{}
interface B extends DenomService, A{

}
