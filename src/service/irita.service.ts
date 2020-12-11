import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct, Result } from '../api/ApiResult';
import {NetworkResDto, TokensResDto,StatusResDto} from '../dto/irita.dto';
@Injectable()
export class IritaService {
    constructor(@InjectModel('Network') private networkModel: any,
                @InjectModel('Tokens') private tokensModel: Model<any>,
                @InjectModel('SyncTask') private taskModel: any
                ) {
    }
    async queryConfig(): Promise<Result<any>>{
        let result:any = {}
        let netWorkDbData = await this.networkModel.queryNetworkList();
        const TokensData = await (this.tokensModel as any).queryAllTokens()
        console.log(TokensData)
        result.networkData = NetworkResDto.bundleData(netWorkDbData);
        result.tokenData = TokensResDto.bundleData(TokensData)
        return result
    }
    async queryStatus(): Promise<StatusResDto>{
        let count: number = await (this.taskModel as any).queryTaskCount() 
        let status: boolean =  count > 0
        return new StatusResDto(status)
    }
}
