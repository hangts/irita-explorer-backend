import * as mongoose from 'mongoose';

export const TxSchema = new mongoose.Schema({
    
});

TxSchema.statics.findTx = async function (query: any, pageNumber:number, pageSize:number){
	return await this.find(query)
					 .sort({height:-1})
					 .skip(Number(pageNumber))
					 .limit(Number(pageSize));
}

TxSchema.statics.count = async function (query: any){
	return await this.find(query).count();
}
