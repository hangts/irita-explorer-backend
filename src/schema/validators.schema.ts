import * as mongoose from 'mongoose';
import { IValidatorsQueryParams } from "../types/validators.interface"
import { Logger } from '@nestjs/common';
export const ValidatorsModel = new mongoose.Schema({
    name: String,
    pubkey: String,
    power: String,
    jailed: Boolean,
    operator: String,
    hash:String
})
ValidatorsModel.index({operator: 1},{unique: true})

ValidatorsModel.statics.findValidators = async function (query:IValidatorsQueryParams) {
    let result: { count?: number; data?: Array<any> } = { }
    let queryParams = {
        jailed: undefined,
    };
    if(query && query.jailed){
        queryParams.jailed = query.jailed;
    }
    if(query && query.useCount && query.useCount === 'true'){
        result.count = await  this.count(queryParams)
    }
    result.data = await this.find(queryParams).skip((Number(query.pageNum) - 1) * Number(query.pageSize))
      .limit(Number(query.pageSize)).select({'_id':0,'__v':0,'hash':0})
    return  result
}
ValidatorsModel.statics.findCount = async function () {
    let defaultJailed= {jailed:true},count:number = 0;
    return count = await this.count(defaultJailed)
}

ValidatorsModel.statics.findAllValidators = async function(){
    let validatorsList = await this.find({}).select({'_id':0,'__v':0})
    return validatorsList
}

ValidatorsModel.statics.saveValidator = async  function (insertValidatorList:any) {
    this.insertMany(insertValidatorList,{ordered: false})
}

ValidatorsModel.statics.updateValidator = async  function (name:string,needUpdateValidator:any) {
    this.updateOne({operator:name},needUpdateValidator,(e => {
       if(e) {
           new Logger('update Validator mongo err',e.message)
       }
    }))
}
ValidatorsModel.statics.deleteValidator = async  function (needDeleteValidator:any) {
    needDeleteValidator.forEach( item => {
        this.deleteOne(item,(e => {
            if(e) {
                new Logger('delete Validator mongo err',e.message)
            }
        }))
    })
}
