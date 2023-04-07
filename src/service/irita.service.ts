import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct, Result } from '../api/ApiResult';
import {addressPrefix, SRC_PROTOCOL, TokenTag} from '../constant/index'
import {NetworkResDto, TokensResDto,StatusResDto} from '../dto/irita.dto';
import { getTaskStatus } from '../helper/task.helper'
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
        result.networkData = NetworkResDto.bundleData(netWorkDbData);

        TokensData.forEach(item => {
            switch (item.src_protocol) {
                case SRC_PROTOCOL.NATIVE:
                    item.tags.push(TokenTag.NativeTokenTag)
                    break
                case SRC_PROTOCOL.HTLT:
                    item.tags.push(TokenTag.HTLTTokenTag)
                    break
                case SRC_PROTOCOL.IBC:
                    item.tags.push(TokenTag.IBCTokenTag)
                    break
                default:
                    item.tags.push(TokenTag.PoolTokenTag)
            }
        })
        result.tokenData = TokensResDto.bundleData(TokensData)
        result.addressPrefix = addressPrefix
        return result
    }
    async queryStatus(): Promise<StatusResDto>{
        let status:boolean = await getTaskStatus(this.taskModel,'')
        return new StatusResDto(status)
    }
}
