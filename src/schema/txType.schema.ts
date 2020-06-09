import * as mongoose from 'mongoose';
import {Utils} from '../util/util';
export const TxTypeSchema = new mongoose.Schema({
    typeName:{type:String, required:true, unique:true,},
    create_time:{
    	type:Number,
    	default:Utils.getCurrentTime(),
    },
    update_time:{
    	type:Number,
    	default:Utils.getCurrentTime(),
    }
});

// txs/types
TxTypeSchema.statics.queryTxTypeList = async function (){
	return await this.find({},{typeName:1})
}

// post txs/types
TxTypeSchema.statics.insertTxTypes = async function (types:string[]){
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
TxTypeSchema.statics.updateTxType = async function (type:string, newType:string){
	if (type && type.length && newType && newType.length) {
		return await this.findOneAndUpdate({
			typeName:type,
		},{
			typeName:newType,
			update_time:Utils.getCurrentTime()
		});
	}else{
		return null;
	}
}

// delete txs/types
TxTypeSchema.statics.deleteTxType = async function (type:string){
	return await this.findOneAndRemove({typeName:type});
}
