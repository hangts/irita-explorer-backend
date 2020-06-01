import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IDenomQueryParams } from '../types/denom.interface';
import { ListStruct, Result } from '../api/ApiResult';
import { IDenom } from '../types/denom.interface';
import { CreateDenomDto } from '../dto/create.denom.dto';

@Injectable()
export class DenomService {
    constructor(@InjectModel('Denom') private denomModel: Model<IDenom>) {
    }

    async queryDenomList(query: IDenomQueryParams): Promise<ListStruct<any[]>> {
        const { pageNumber, pageSize } = query;
        const dataList: any[] = await this.denomModel.find().skip(Number(pageNumber)).limit(Number(pageSize)).exec();
        return this.getListResult(dataList, Number(pageNumber), Number(pageSize), 0);
    }

    getListResult(data: any, pageNumber: number, pageSize: number, count: number) {
        return new ListStruct(data, Number(pageNumber), Number(pageSize), count);
    }

    async createDenom(data: CreateDenomDto): Promise<CreateDenomDto>{


        return  {
            height: 100,
            hash: 'hello world',
            memo: '红豆生南国',
        };
    }


}
