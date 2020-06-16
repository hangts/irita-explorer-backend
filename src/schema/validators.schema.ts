import * as mongoose from 'mongoose';
import { IValidatorsQueryParams } from "../types/validators.interface"
import { Logger } from '@nestjs/common';
import { IValidatorsStruct } from '../types/schemaTypes/validators.interface';
export const ValidatorSchema = new mongoose.Schema({
    name: String,
    pubkey: String,
    power: String,
    jailed: Boolean,
    operator: String,
    hash:String
})
ValidatorSchema.index({operator: 1},{unique: true})

ValidatorSchema.statics.findValidators = async function (query:IValidatorsQueryParams) {
    let result: { count?: number; data?: Array<any> } = { }
    let queryParams = {
        jailed: undefined,
    };
    queryParams.jailed = query.jailed;
    if(query && query.useCount){
        result.count = await  this.count(queryParams)
    }
    result.data = await this.find(queryParams).skip((Number(query.pageNum) - 1) * Number(query.pageSize))
      .limit(Number(query.pageSize)).select({'_id':0,'__v':0,'hash':0})
    return  result
}
ValidatorSchema.statics.findCount = async function () {
    return await this.count();
}

ValidatorSchema.statics.findAllValidators = async function(){
    let validatorsList = await this.find({}).select({'_id':0,'__v':0})
    return validatorsList
}

ValidatorSchema.statics.saveValidator = async  function (insertValidatorList:[]) {
   return await this.insertMany(insertValidatorList,{ordered: false})
}

ValidatorSchema.statics.updateValidator = async  function (name:string,needUpdateValidator:[]) {
    return await this.updateOne({operator:name},needUpdateValidator)
}
ValidatorSchema.statics.deleteValidator = async  function (needDeleteValidator:[]) {
    needDeleteValidator.forEach( item => {
        this.deleteOne(item)
    })
}
