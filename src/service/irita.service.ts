import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct, Result } from '../api/ApiResult';
    
import { NetworkResDto } from '../dto/irita.dto';
@Injectable()
export class IritaService {
    constructor(@InjectModel('Network') private networkModel: any) {
    }

    async queryConfig(): Promise<NetworkResDto[]>{
        let data = await this.networkModel.queryNetworkList();
        return NetworkResDto.bundleData(data);
    }
}