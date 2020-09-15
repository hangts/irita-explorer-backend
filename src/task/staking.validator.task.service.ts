import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {StakingValidatorHttp} from "../http/lcd/staking.validator.http";
import { Model } from "mongoose"
import {formatDateStringToNumber, getTimestamp} from "../util/util";
import {IStakingValidatorDbMap, IStakingValidatorLcdMap} from "../types/schemaTypes/staking.validator.interface";

@Injectable()

export class StakingValidatorTaskService {
  constructor(@InjectModel('StakingSyncValidators') private stakingSyncValidatorsModel: Model<any>,
              private readonly stakingValidatorHttp: StakingValidatorHttp) {
    this.doTask = this.doTask.bind(this);
  }

  async doTask(): Promise<void> {
    let pageNum = 1, pageSize = 100, allValidatorsFromLcd = []
    let validatorListDataFromLcd = await this.stakingValidatorHttp.queryValidatorListFromLcd(pageNum, pageSize)
    if (typeof validatorListDataFromLcd == 'undefined') {
      return
    }
    if (validatorListDataFromLcd && validatorListDataFromLcd.length > 0) {
      allValidatorsFromLcd = allValidatorsFromLcd.concat(validatorListDataFromLcd);
    }
    //判断是否有第二页数据 如果有使用while循环请求
    while (allValidatorsFromLcd && allValidatorsFromLcd.length === pageSize) {
      pageNum++
      allValidatorsFromLcd = await this.stakingValidatorHttp.queryValidatorListFromLcd(pageNum, pageSize);
      //将第二页及以后的数据合并
      allValidatorsFromLcd = allValidatorsFromLcd.concat(allValidatorsFromLcd)
    }

    //设置map
    let validatorsFromDb: [] = await (this.stakingSyncValidatorsModel as any).queryAllValidators();
    let validatorsFromLcdMap:Map<string, IStakingValidatorLcdMap> = new Map()
    let validatorsFromDbMap:Map<string,IStakingValidatorDbMap> = new Map()
    if (allValidatorsFromLcd && Array.isArray(allValidatorsFromLcd) && allValidatorsFromLcd.length > 0) {
      allValidatorsFromLcd.forEach((item: any) => {
        // 处理日期
        if (item.commission && item.commission.update_time) {
          item.commission.update_time = formatDateStringToNumber(item.commission.update_time)
        }
        // 处理日期
        if (item.unbonding_time) {
          item.unbonding_time = formatDateStringToNumber(item.unbonding_time)
        }

        item.create_time = getTimestamp()
        item.update_time = getTimestamp()

        validatorsFromLcdMap.set(item.operator_address, item)

      })
    }

    this.insertAndUpdateValidators(validatorsFromLcdMap)
    //TODO 查询db中的验证人 与 lcd 对比 做删除操作
    if (validatorsFromDb && Array.isArray(validatorsFromDb) && validatorsFromDb.length > 0) {
      validatorsFromDb.forEach((item: any) => {
        validatorsFromDbMap.set(item.operator_address, item)
      })
    }
  }

  private async insertAndUpdateValidators(validatorsFromLcdMap) {
    validatorsFromLcdMap.forEach((validate) => {
      (this.stakingSyncValidatorsModel as any).insertValidator(validate)
    })
  }
}
