import * as mongoose from 'mongoose';
import { ITxTypeStruct } from '../types/schemaTypes/txType.interface';
import { getTimestamp } from '../util/util';
export const TxTypeSchema = new mongoose.Schema({
    typeName:{type:String, required:true, unique:true,},
    create_time:{
    	type:Number,
    	default:getTimestamp(),
    },
    update_time:{
    	type:Number,
    	default:getTimestamp(),
    }
});

// txs/types
TxTypeSchema.statics.queryTxTypeList = async function ():Promise<ITxTypeStruct[]>{
	return await this.find({},{typeName:1})
}

// post txs/types
TxTypeSchema.statics.insertTxTypes = async function (types:string[]):Promise<ITxTypeStruct[]>{
	if (types && types.length) {
		let data = types.map((t)=>{
			let item = {
				typeName:t,
			}
		    return new this(item);
		});
		return await this.insertMany(data);
	}else{
		return [];
	}
}

// put txs/types
TxTypeSchema.statics.updateTxType = async function (type:string, newType:string):Promise<ITxTypeStruct>{
	if (type && type.length && newType && newType.length) {
		return await this.findOneAndUpdate({
			typeName:type,
		},{
			typeName:newType,
			update_time:getTimestamp(),
		});
	}else{
		return null;
	}
}

// delete txs/types
TxTypeSchema.statics.deleteTxType = async function (type:string):Promise<ITxTypeStruct>{
	return await this.findOneAndRemove({typeName:type});
}
