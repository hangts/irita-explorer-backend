import { Injectable,Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IDenomQueryParams } from '../types/denom.interface';
import { ApiError, ListStruct } from '../api/ApiResult';
import { IDenom } from '../types/denom.interface';
import { CreateDenomDto } from '../dto/create.denom.dto';
import {cfg} from '../config';
import { ErrorCodes, ResultCodesMaps } from '../api/ResultCodes';
import {DenomHttp} from '../http/denom.http';

@Injectable()
export class DenomService {
    constructor(@InjectModel('Denom') private denomModel: Model<IDenom>) {
    }

    async queryList(query: IDenomQueryParams): Promise<ListStruct<any[]>> {
        const { pageNumber, pageSize } = query;
        const denomList: any[] = await this.denomModel.find().skip(Number(pageNumber)).limit(Number(pageSize)).exec();
        return new ListStruct(denomList, Number(pageNumber), Number(pageSize), 0);
    }

    async createOne(data: CreateDenomDto): Promise<CreateDenomDto>{
        return  {
            height: 100,
            hash: 'hello world',
            memo: '红豆生南国',
        };
    }

    createMany(data: any[]){

    }

    async async(): Promise<void>{
        /*try {
            const url: string = `${cfg.serverCfg.lcdAddr}/nft/nfts/denoms`;
            const data: any = await new HttpService().get(url).toPromise().then(res => res.data);
        } catch (e) {
            new Logger().error('api-error:',e.message);
            throw new ApiError(ErrorCodes.failed, ResultCodesMaps.get(ErrorCodes.failed));
        }*/
        const data: any = await DenomHttp.queryDenomsFromLcd();
    }
}

