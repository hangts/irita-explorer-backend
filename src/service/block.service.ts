import { Injectable,HttpService,  } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IBlockQueryParams } from '../types/block.interface';
import { ListStruct } from '../api/ApiResult';
import { IBlockEntities } from '../types/block.interface';
import { IBlock } from '../types/block.interface';
import { ApiError } from '../api/ApiResult';
import { ErrorCodes, ResultCodesMaps } from '../api/ResultCodes';
import {cfg} from '../config';
import { AxiosResponse } from 'axios'
import { Observable } from 'rxjs'

@Injectable()
export class BlockService {
    constructor(@InjectModel('Block') private blockModel: Model<IBlockEntities>, private readonly httpService: HttpService) {
    }

    async queryBlockList(query: IBlockQueryParams): Promise<ListStruct<IBlock[]>> {
        let { pageNumber, pageSize, useCount } = query;
        if (!pageNumber) pageNumber = '1';
        if (!pageSize) pageSize = '10';
        try {
            const blockList: any[] = await this.blockModel.find().skip((Number(pageNumber) - 1) * Number(pageSize)).limit(Number(pageSize)).exec();
            let count: number;
            if (useCount) count = await this.blockModel.find().count().exec();
            const resList: any[] = blockList.map((b) => {
                return {
                    height: b.height,
                    txn: b.txn,
                    hash: b.hash,
                    time: b.time,
                };
            });
            return new ListStruct(resList, Number(pageNumber), Number(pageSize), count);
        } catch (e) {
            console.error('mongo-error:', e.message);
            throw new ApiError(ErrorCodes.failed, ResultCodesMaps.get(ErrorCodes.failed));
        }

    }

    async queryBlockDetail(p): Promise<any> {
        const { height } = p;
        if (!height) throw new ApiError(ErrorCodes.failed, 'height is missed');
        try {
            const res = await this.blockModel.findOne({ height });
            let data: object = null;
            if (res) {
                data = {
                    height: res.height,
                    txn: res.txn,
                    hash: res.hash,
                    time: res.time,
                };
            }
            return data;
        } catch (e) {
            console.error('mongo-error:', e.message);
            throw new ApiError(ErrorCodes.failed, ResultCodesMaps.get(ErrorCodes.failed));
        }

    }

    async queryLatestBlock(): Promise<any> {
        try {
            return await this.queryLatestBlockFromLcd();
        } catch (e) {
            console.error('api-error:', e.message);
            try {
                return await this.queryLatestBlockFromDB();
            }catch (e) {
                console.error('mongo-error:', e.message);
                throw new ApiError(ErrorCodes.failed, ResultCodesMaps.get(ErrorCodes.failed));
            }
        }

    }
    
    async queryLatestBlockFromDB():Promise<any>{
        try{
            return await this.blockModel.findOne({}).sort({height:-1});
        }catch (e) {
            throw new ApiError(ErrorCodes.failed, ResultCodesMaps.get(ErrorCodes.failed));
        }
    }

    async queryLatestBlockFromLcd():Promise<any>{
        const url: string = `${cfg.lcdAddr}/blocks/latest`;
        return await this.httpService.get(url).toPromise().then(res => res.data);
    }


}

