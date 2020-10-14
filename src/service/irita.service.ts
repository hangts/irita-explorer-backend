import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct, Result } from '../api/ApiResult';

import {NetworkResDto, TokenScaleResDto} from '../dto/irita.dto';
@Injectable()
export class IritaService {
    constructor(@InjectModel('Network') private networkModel: any,
                @InjectModel('TokenScale') private tokenScaleModel:Model<any>) {
    }

    async queryConfig(): Promise<Result<any>>{
        let result:any = {}
        let netWorkDbData = await this.networkModel.queryNetworkList();
        const tokenScaleData = await (this.tokenScaleModel as any).queryAllTokens()
        result.networkData = NetworkResDto.bundleData(netWorkDbData);
        result.tokenData = TokenScaleResDto.bundleData(tokenScaleData)
        return result
    }
}
