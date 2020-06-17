import { Injectable, Logger } from '@nestjs/common';
import { ValidatorsHttp } from '../http/lcd/validators.http';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ValidatorSchema } from '../schema/validators.schema';
import { IValidatorsStruct } from '../types/schemaTypes/validators.interface';
import md5 from 'blueimp-md5';
import { getTimestamp } from '../util/util';

@Injectable()
export class ValidatorsTaskService {
    constructor(
        @InjectModel('SyncValidators') private ValidatorsModel: Model<any>,
        private readonly validatorsHttp: ValidatorsHttp) {
        this.doTask = this.doTask.bind(this);
    }

    doTask(): Promise<void> {
        return new Promise(async (resolve) => {
            let isTruePageNum = 1, isFalsePageNum = 1, limitSize = 100, allValidators = [], allValidatorsFromLcd;
            //验证人第一次默认请求状态为 jailed = true / false 默认请求第一页
            let validatorsFromLcdISTrue: any = await this.validatorsHttp.queryValidatorsFromLcd(true, isTruePageNum, limitSize);
            if (validatorsFromLcdISTrue.result.length > 0) {
                validatorsFromLcdISTrue.result.forEach((item: any) => {
                    item.jailed = true;
                });
            }
            let validatorsFromLcdISFalse: any = await this.validatorsHttp.queryValidatorsFromLcd(false, isFalsePageNum, limitSize);
            if (validatorsFromLcdISFalse.result.length > 0) {
                validatorsFromLcdISFalse.result.forEach((item: any) => {
                    item.jailed = false;
                });
            }
            //第一次请求的结果合并
            allValidators = validatorsFromLcdISTrue.result.concat(validatorsFromLcdISFalse.result);
            //判断是否有第二页数据 如果有使用while循环请求
            while (validatorsFromLcdISTrue.result.length === limitSize) {
                isTruePageNum++;
                validatorsFromLcdISTrue = await this.validatorsHttp.queryValidatorsFromLcd(true, isTruePageNum, limitSize);
                //将第二页及以后的数据合并
                allValidators.concat(validatorsFromLcdISTrue.result);
            }
            while (validatorsFromLcdISFalse.result.length === limitSize) {
                isFalsePageNum++;
                validatorsFromLcdISFalse = await this.validatorsHttp.queryValidatorsFromLcd(false, isFalsePageNum, limitSize);
                allValidators.concat(validatorsFromLcdISFalse.result);
            }

            allValidatorsFromLcd = allValidators;

            const validatorsFromDb: [] = await (this.ValidatorsModel as any).findAllValidators();
            let lcdValidatorMap: Map<string, IValidatorsStruct> | null = new Map<string, IValidatorsStruct>();
            let dbValidatorsMap: Map<string, IValidatorsStruct> | null = new Map<string, IValidatorsStruct>();

            if (allValidatorsFromLcd && Array.isArray(allValidatorsFromLcd) && allValidatorsFromLcd.length > 0) {
                allValidatorsFromLcd.forEach((item: any) => {
                    lcdValidatorMap.set(item.operator, item);
                });
            }
            if (validatorsFromDb && Array.isArray(validatorsFromDb) && validatorsFromDb.length > 0) {
                validatorsFromDb.forEach((item: any) => {
                    dbValidatorsMap.set(item.operator, item);
                });
            }
            let insertValidators = ValidatorsTaskService.getShouldInsertList(lcdValidatorMap, dbValidatorsMap);
            let upDateValidators = ValidatorsTaskService.getShouldUpdateList(lcdValidatorMap, dbValidatorsMap);
            let deleteValidators = ValidatorsTaskService.getShouldDeleteList(lcdValidatorMap, dbValidatorsMap);
            await this.saveValidators(insertValidators);
            await this.updateValidator(upDateValidators);
            await this.deleteValidator(deleteValidators);
            resolve();
        });
    }

    static getShouldInsertList(lcdValidatorMap: Map<string, IValidatorsStruct> | null, validatorsFromDb: Map<string, IValidatorsStruct> | null): Map<string, IValidatorsStruct> {
        if (!validatorsFromDb || validatorsFromDb.size <= 0) {
            return lcdValidatorMap;
        } else {
            const validatorsNeedInsertMap = new Map<string, IValidatorsStruct>();
            if (!lcdValidatorMap) {
                return new Map<string, IValidatorsStruct>();
            } else {
                for (let key of lcdValidatorMap.keys()) {
                    if (!validatorsFromDb.has(key)) {
                        validatorsNeedInsertMap.set(key, lcdValidatorMap.get(key));
                    }
                }
            }
            return validatorsNeedInsertMap;
        }
    }

    static getShouldUpdateList(lcdValidatorMap: Map<string, IValidatorsStruct> | null, validatorsFromDb: Map<string, IValidatorsStruct> | null): Map<string, IValidatorsStruct> {
        if (!validatorsFromDb || validatorsFromDb.size <= 0) {
            return new Map<string, IValidatorsStruct>();
        } else {
            const validatorsNeedUpdateMap = new Map<string, IValidatorsStruct>();
            if (!lcdValidatorMap || lcdValidatorMap.size <= 0) {
                return new Map<string, IValidatorsStruct>();
            } else {
                for (let key of lcdValidatorMap.keys()) {
                    const { power, jailed, name } = lcdValidatorMap.get(key),
                        lcdValidatorMapMd5Str = `${name}${power}${jailed}`,
                        lcdValidatorHash = md5(lcdValidatorMapMd5Str),
                        dbValidatorHash = validatorsFromDb.get(key);
                    if (dbValidatorHash && dbValidatorHash.hash !== lcdValidatorHash) {
                        let dbValidator: IValidatorsStruct = lcdValidatorMap.get(key);
                        dbValidator.hash = lcdValidatorHash;
                        validatorsNeedUpdateMap.set(key, dbValidator);
                    }
                }
            }
            return validatorsNeedUpdateMap;
        }
    }

    static getShouldDeleteList(lcdValidatorMap: Map<string, IValidatorsStruct> | null, validatorsFromDb: Map<string, IValidatorsStruct> | null): Map<string, IValidatorsStruct> {
        if (!validatorsFromDb && validatorsFromDb.size <= 0) {
            return new Map<string, IValidatorsStruct>();
        } else {
            if (!lcdValidatorMap && lcdValidatorMap.size <= 0) {
                return new Map<string, IValidatorsStruct>();
            } else {
                const needValidatorMap = new Map<string, IValidatorsStruct>();
                for (let key of validatorsFromDb.keys()) {
                    if (!lcdValidatorMap.has(key)) {
                        needValidatorMap.set(key, validatorsFromDb.get(key));
                    }
                }
                return needValidatorMap;
            }
        }
    }

    private async saveValidators(shouldInsertMap: Map<string, IValidatorsStruct>): Promise<boolean> {
        let insertValidatorList = Array.from(shouldInsertMap.values()).map((validator) => {
            const { power, jailed, name, pubkey } = validator;
            const str: string = `${name}${power}${jailed}`,
                hash = md5(str);
            return {
                operator: validator.operator,
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
        return true;
    }

    private async updateValidator(shouldUpdateValidatorMap: Map<string, IValidatorsStruct>): Promise<boolean> {
        if (shouldUpdateValidatorMap && shouldUpdateValidatorMap.size > 0) {
            for (let key of shouldUpdateValidatorMap.keys()) {
                let updateValidator = shouldUpdateValidatorMap.get(key);
                await (this.ValidatorsModel  as any).updateValidator(key, updateValidator);
            }
        }
        return true;
    }

    private async deleteValidator(shouldDeleteValidatorMap: Map<string, IValidatorsStruct>): Promise<boolean> {
        if (shouldDeleteValidatorMap && shouldDeleteValidatorMap.size > 0) {
            let needDeleteValidatorList = Array.from(shouldDeleteValidatorMap.values()).map((validator) => {
                return {
                    operator: validator.operator,
                };
            });
            await (this.ValidatorsModel as any).deleteValidator(needDeleteValidatorList);
            return true;
        }
    }
}




