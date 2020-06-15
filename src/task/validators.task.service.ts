import { Injectable ,Logger } from '@nestjs/common';
import { ValidatorsHttp } from "../http/lcd/validators.http"
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ValidatorsModel } from '../schema/validators.schema';
import { validators } from "../types/schemaTypes/validators.interface"
import md5 from "blueimp-md5"
import { ILcdNftStruct } from '../types/task.interface';
import { INftStruct } from '../types/schemaTypes/nft.interface';
import { getTimestamp } from '../util/util';
@Injectable()
export class ValidatorsTaskService {
 constructor(
   @InjectModel('SyncValidators') private ValidatorsModel: Model<any>,
   private readonly validatorsHttp : ValidatorsHttp) {
   this.doTask = this.doTask.bind(this);
 }
    doTask(): Promise<void> {
        return new Promise( async (resolve) =>{
          let validatorStatue = true,pageNum = 1,limitSize = 100, allValidators = [],firstQueryValidators,allValidatorsFromLcd;
          //验证人第一次默认请求状态为 jailed = true / false 默认请求第一页
          let validatorsFromLcdISTrue: any = await this.validatorsHttp.queryValidatorsFromLcd(validatorStatue,pageNum);
          validatorStatue = false
          let validatorsFromLcdISFalse: any = await this.validatorsHttp.queryValidatorsFromLcd(validatorStatue,pageNum);
          //第一次请求的结果合并
          firstQueryValidators = validatorsFromLcdISTrue.result.concat(validatorsFromLcdISFalse.result)
          //判断是否有第二页数据 如果有使用while循环请求
          while (validatorsFromLcdISTrue.result.length === limitSize){
            pageNum++
            validatorsFromLcdISTrue = await this.validatorsHttp.queryValidatorsFromLcd(validatorStatue,pageNum);
            //将第二页及以后的数据合并
            allValidators.concat(validatorsFromLcdISTrue.result)
          }
          while (validatorsFromLcdISFalse.result.length === limitSize){
            pageNum++
            validatorsFromLcdISFalse = await this.validatorsHttp.queryValidatorsFromLcd(validatorStatue,pageNum);
            allValidators.concat(validatorsFromLcdISFalse.result)
          }

          allValidatorsFromLcd = firstQueryValidators.concat(allValidators)

          const validatorsFromDb : any = await (this.ValidatorsModel as any).findAllValidators()
          let lcdValidatorMap: Map<string, validators> | null = new Map<string, validators>();
          let dbValidatorsMap: Map<string,validators> | null = new Map<string, validators>();

          if(allValidatorsFromLcd && Array.isArray(allValidatorsFromLcd) && allValidatorsFromLcd.length > 0){
            allValidatorsFromLcd.forEach( (item:any) => {
                  lcdValidatorMap.set(item.operator,item)
              })
          }
           if(validatorsFromDb && Array.isArray(validatorsFromDb) && validatorsFromDb.length > 0){
               validatorsFromDb.forEach( (item:any) => {
                  dbValidatorsMap.set(item.operator,item)
               })
           }
           let insertValidators = ValidatorsTaskService.getShouldInsertList(lcdValidatorMap,dbValidatorsMap)
           let upDateValidators = ValidatorsTaskService.getShouldUpdateList(lcdValidatorMap,dbValidatorsMap)
           let deleteValidators = ValidatorsTaskService.getShouldDeleteList(lcdValidatorMap,dbValidatorsMap)
           await this.saveValidators(insertValidators)
           await this.updateValidator(upDateValidators)
           await this.deleteValidator(deleteValidators)
           resolve()
       })
    }
    static getShouldInsertList (lcdValidatorMap: Map<string, validators> | null ,validatorsFromDb: Map<string,validators> | null): Map<string, validators>  {
        if(!validatorsFromDb || validatorsFromDb.size <= 0){
            return lcdValidatorMap
        }else {
            const validatorsNeedInsertMap = new Map<string, validators>()
            if(!lcdValidatorMap){
                return new Map<string, validators>()
            }else{
                for(let key of lcdValidatorMap.keys()){
                    if(!validatorsFromDb.has(key)){
                      validatorsNeedInsertMap.set(key,lcdValidatorMap.get(key))
                    }
                }
          }
          return validatorsNeedInsertMap
        }
    }
    static getShouldUpdateList (lcdValidatorMap: Map<string, validators> | null ,validatorsFromDb: Map<string,validators> | null): Map<string, validators>  {
        if(!validatorsFromDb || validatorsFromDb.size <= 0){
            return new Map<string, validators>()
        }else {
            const validatorsNeedUpdateMap = new Map<string, validators>()
            if(!lcdValidatorMap || lcdValidatorMap.size <= 0){
                return new Map<string, validators>()
            }else{
                for(let key of lcdValidatorMap.keys()){
                    const { power, jailed, name  } =  lcdValidatorMap.get(key),
                        lcdValidatorMapMd5Str = `${name}${power}${jailed}`,
                        lcdValidatorHash = md5(lcdValidatorMapMd5Str),
                        dbValidatorHash = validatorsFromDb.get(key);
                        if(dbValidatorHash && dbValidatorHash.hash !== lcdValidatorHash){
                            let dbValidator:validators =  lcdValidatorMap.get(key)
                            dbValidator.hash = lcdValidatorHash
                            validatorsNeedUpdateMap.set(key,dbValidator)
                    }
                }
            }
            return validatorsNeedUpdateMap
        }
    }
    static getShouldDeleteList (lcdValidatorMap: Map<string, validators>| null , validatorsFromDb: Map<string,validators> | null): Map<string, validators> {
        if(!validatorsFromDb && validatorsFromDb.size <= 0 ){
            return new Map<string,validators>()
        }else {
            if(!lcdValidatorMap && lcdValidatorMap.size <= 0) {
                return lcdValidatorMap
            }else {
                const needValidatorMap = new Map<string,validators>()
                for (let key of validatorsFromDb.keys()) {
                    if (!lcdValidatorMap.has(key)) {
                        needValidatorMap.set(key, validatorsFromDb.get(key));
                    }
                }
                return needValidatorMap
            }
        }
    }
    private async saveValidators(shouldInsertMap: Map<string, validators>) :Promise<boolean>{
        let insertValidatorList = Array.from(shouldInsertMap.values()).map((validator) => {
            const { power, jailed, name ,pubkey} = validator;
            const str: string = `${name}${power}${jailed}`,
                hash = md5(str);
                return {
                    operator:validator.operator,
                    name: name,
                    pubkey: pubkey,
                    power: power,
                    jailed: jailed,
                    create_time: getTimestamp(),
                    update_time: getTimestamp(),
                    hash,
                };
        });
        await (this.ValidatorsModel as any).saveValidator(insertValidatorList);
        return true
    }
    private async updateValidator(shouldUpdateValidatorMap:Map<string, validators>):Promise<boolean>{
        if(shouldUpdateValidatorMap && shouldUpdateValidatorMap.size > 0){
            for (let key of shouldUpdateValidatorMap.keys()){
                let updateValidator = shouldUpdateValidatorMap.get(key);
                await (this.ValidatorsModel as any).updateValidator(key,updateValidator);
            }
        }
        return  true
    }
    private async deleteValidator(shouldDeleteValidatorMap: Map<string,validators>): Promise<boolean>{
        if(shouldDeleteValidatorMap && shouldDeleteValidatorMap.size > 0){
            let needDeleteValidatorList = Array.from(shouldDeleteValidatorMap.values()).map((validator) => {
                return {
                    operator:validator.operator
                }
            })
            await (this.ValidatorsModel as any).deleteValidator(needDeleteValidatorList);
            return true
        }
    }
}




