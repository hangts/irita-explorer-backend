import { Injectable ,Logger } from '@nestjs/common';
import { ValidatorsHttp } from "../http/lcd/validators.http"
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ValidatorSchema } from '../schema/validators.schema';
import { IValidatorsStruct } from "../types/schemaTypes/validators.interface"
import md5 from "blueimp-md5"
import { getTimestamp } from '../util/util';
@Injectable()
export class ValidatorsTaskService {
 constructor(
   @InjectModel('SyncValidators') private ValidatorsModel: Model<any>,
   private readonly validatorsHttp : ValidatorsHttp) {
   this.doTask = this.doTask.bind(this);
 }
    async doTask(): Promise<void> {
        let PageNum = 1,limitSize = 100, allValidatorsFromLcd = [];
        //验证人第一次默认请求 默认请求第一页
        let validatorsFromLcd: any[] = await this.validatorsHttp.queryValidatorsFromLcd(null,PageNum,limitSize);
        if(validatorsFromLcd && validatorsFromLcd.length > 0) {
            allValidatorsFromLcd = allValidatorsFromLcd.concat(validatorsFromLcd);
        }

        //判断是否有第二页数据 如果有使用while循环请求
        while (validatorsFromLcd && validatorsFromLcd.length === limitSize){
            PageNum++
            validatorsFromLcd = await this.validatorsHttp.queryValidatorsFromLcd(null,PageNum,limitSize);
            //将第二页及以后的数据合并
            allValidatorsFromLcd = allValidatorsFromLcd.concat(validatorsFromLcd)
        }

        allValidatorsFromLcd.forEach( (item:any) => {
            item.jailed = Boolean(item.jailed);
        })
        const validatorsFromDb : [] = await (this.ValidatorsModel as any).findAllValidators();
        let lcdValidatorMap: Map<string, IValidatorsStruct> | null = new Map<string, IValidatorsStruct>();
        let dbValidatorsMap: Map<string,IValidatorsStruct> | null = new Map<string, IValidatorsStruct>();

        if(allValidatorsFromLcd && Array.isArray(allValidatorsFromLcd) && allValidatorsFromLcd.length > 0){
            allValidatorsFromLcd.forEach( (item:any) => {
                lcdValidatorMap.set(item.name, item)
            })
        }
         if(validatorsFromDb && Array.isArray(validatorsFromDb) && validatorsFromDb.length > 0){
            validatorsFromDb.forEach( (item:any) => {
                dbValidatorsMap.set(item.name, item)
            })
         }

         let insertValidators = ValidatorsTaskService.getShouldInsertList(lcdValidatorMap,dbValidatorsMap)
         let upDateValidators = ValidatorsTaskService.getShouldUpdateList(lcdValidatorMap,dbValidatorsMap)
         let deleteValidators = ValidatorsTaskService.getShouldDeleteList(lcdValidatorMap,dbValidatorsMap)
         await this.saveValidators(insertValidators)
         await this.updateValidator(upDateValidators)
         await this.deleteValidator(deleteValidators)
    }

    static getShouldInsertList (lcdValidatorMap: Map<string, IValidatorsStruct> | null ,validatorsFromDb: Map<string,IValidatorsStruct> | null): Map<string, IValidatorsStruct>  {
        if(!validatorsFromDb || validatorsFromDb.size <= 0){
            return lcdValidatorMap
        }else {
            const validatorsNeedInsertMap = new Map<string, IValidatorsStruct>()
            if(!lcdValidatorMap){
                return new Map<string, IValidatorsStruct>()
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

    static getShouldUpdateList (lcdValidatorMap: Map<string, IValidatorsStruct> | null ,validatorsFromDb: Map<string,IValidatorsStruct> | null): Map<string, IValidatorsStruct>  {
        if(!validatorsFromDb || validatorsFromDb.size <= 0){
            return new Map<string, IValidatorsStruct>()
        }else {
            const validatorsNeedUpdateMap = new Map<string, IValidatorsStruct>()
            if(!lcdValidatorMap || lcdValidatorMap.size <= 0){
                return new Map<string, IValidatorsStruct>()
            }else{
                for(let key of lcdValidatorMap.keys()){
                    const { power, jailed, operator, details} =  lcdValidatorMap.get(key),
                        lcdValidatorMapMd5Str = `${operator}${power}${jailed}${details||''}`,
                        lcdValidatorHash = md5(lcdValidatorMapMd5Str),
                        dbValidatorHash = validatorsFromDb.get(key);
                    if(dbValidatorHash && dbValidatorHash.hash !== lcdValidatorHash){
                        let dbValidator:IValidatorsStruct =  lcdValidatorMap.get(key)
                        dbValidator.hash = lcdValidatorHash
                        validatorsNeedUpdateMap.set(key,dbValidator)
                    }
                }
            }
            return validatorsNeedUpdateMap
        }
    }

    static getShouldDeleteList (lcdValidatorMap: Map<string, IValidatorsStruct>| null , validatorsFromDb: Map<string,IValidatorsStruct> | null): Map<string, IValidatorsStruct> {
        if(!validatorsFromDb && validatorsFromDb.size <= 0 ){
            return new Map<string,IValidatorsStruct>()
        }else {
            if(!lcdValidatorMap && lcdValidatorMap.size <= 0) {
                return new Map<string, IValidatorsStruct>()
            }else {
                const needValidatorMap = new Map<string,IValidatorsStruct>()
                for (let key of validatorsFromDb.keys()) {
                    if (!lcdValidatorMap.has(key)) {
                        needValidatorMap.set(key, validatorsFromDb.get(key));
                    }
                }
                return needValidatorMap
            }
        }
    }

    private async saveValidators(shouldInsertMap: Map<string, IValidatorsStruct>) :Promise<any>{
        let insertValidatorList = Array.from(shouldInsertMap.values()).map((validator) => {
            const {operator, power, jailed, name ,pubkey, details} = validator;
            const str: string = `${operator}${power}${jailed}${details||''}`,
            hash = md5(str);
            return {
                operator:operator,
                name: name,
                pubkey: pubkey,
                power: power,
                jailed: jailed,
                details:details || '',
                create_time: getTimestamp(),
                update_time: getTimestamp(),
                hash,
            };
        });
        await (this.ValidatorsModel as any).saveValidator(insertValidatorList);
    }

    private async updateValidator(shouldUpdateValidatorMap:Map<string, IValidatorsStruct>):Promise<any>{
        if(shouldUpdateValidatorMap && shouldUpdateValidatorMap.size > 0){
            for (let key of shouldUpdateValidatorMap.keys()){
                let updateValidator = shouldUpdateValidatorMap.get(key);
                await (this.ValidatorsModel  as any).updateValidator(key,updateValidator);
            }
        }
    }

    private async deleteValidator(shouldDeleteValidatorMap: Map<string,IValidatorsStruct>): Promise<any>{
        if(shouldDeleteValidatorMap && shouldDeleteValidatorMap.size > 0){
            Array.from(shouldDeleteValidatorMap.keys()).forEach(async (key) => {
                await (this.ValidatorsModel as any).deleteValidator(key);
            })
        }
    }
}




