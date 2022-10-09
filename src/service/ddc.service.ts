import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct } from '../api/ApiResult';
import { IDdc, IDdcStruct, IDdcMapStruct } from '../types/schemaTypes/ddc.interface';
import { DdcDetailReqDto, DdcDetailResDto, DdcListReqDto, DdcListResDto } from '../dto/ddc.dto';

@Injectable()
export class DdcService {
  constructor(
    @InjectModel('Ddc') private ddcModel: Model<IDdc>,
    @InjectModel('Statistics') private statisticsModel: any,
  ) {
  }

  async queryList(query: DdcListReqDto): Promise<ListStruct<DdcListResDto[]>> {
    const { pageNum, pageSize, contract_address, ddc_id, useCount, owner } = query, res: DdcListResDto[] = [];
    let ddcData, count = null;
    if (pageNum && pageSize) {
      ddcData = await (this.ddcModel as any).findList(pageNum, pageSize, contract_address, ddc_id, owner);
      for (const ddc of ddcData?.data) {
        const result = new DdcListResDto(
          ddc.ddc_id,
          ddc.contract_address,
          ddc.owner,
          ddc.creator,
          this.handleDdcUri(ddc.ddc_uri),
          ddc.ddc_data,
          ddc.ddc_type,
          ddc.ddc_name,
          ddc.amount,
          ddc.latest_tx_time,
          ddc.is_delete,
          ddc.is_freeze,
        );
        res.push(result);
      }
    }
    if (useCount) {
      if (contract_address || ddc_id || owner){
        count = await (this.ddcModel as any).findDdcListCount(contract_address, ddc_id, owner);
      }else {
        count = await this.queryDdcCount()
      }
    }

    return new ListStruct(res, pageNum, pageSize, count);
  }

  handleDdcUri(ddcUri: string) {
    if (!ddcUri) {
      return ddcUri;
    }
    try {
      const { url } = JSON.parse(ddcUri);
      if (url) {
        return url;
      }
    } catch (e) {
      return ddcUri;
    }
    return ddcUri;
  }

  // ddcs/details
  async queryDetail(query: DdcDetailReqDto): Promise<DdcDetailResDto | null> {
    const { contract_address, ddc_id } = query;
    const ddc: IDdcStruct = await (this.ddcModel as any).findOneByContractAddrAndDdcId(contract_address, ddc_id);
    if (ddc) {
      return new DdcDetailResDto(
        ddc.ddc_id,
        ddc.contract_address,
        ddc.owner,
        ddc.creator,
        this.handleDdcUri(ddc.ddc_uri),
        ddc.ddc_data,
        ddc.ddc_type,
        ddc.ddc_name,
        ddc.amount,
      );
    } else {
      return null;
    }
  }

  async queryDdcCount():Promise<any>{
    const ddcCnt = await this.statisticsModel.findStatisticsRecord("ddc_all")
    return ddcCnt?.count
  }


}

