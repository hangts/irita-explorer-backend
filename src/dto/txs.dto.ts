// import { IsString, IsInt, Length , Min, Max, IsOptional, Equals} from 'class-validator';
import {BaseReqDto, BaseResDto, PagingDto} from './base.dto';
import {ApiError} from '../api/ApiResult';
import {ErrorCodes} from '../api/ResultCodes';
import constant from '../constant/constant';
//txs list request dto
export class TxListReqDto extends PagingDto{
	
	type:string;
  status: string;
  beginTime:string;
  endTime:string;

  static validate(value:any){
  	super.validate(value);
		if (value.status && value.status !=='1' && value.status !=='2') {
			throw new ApiError(ErrorCodes.InvalidParameter, 'status must be 1 or 2');
		}
	}

	static convert(value:any):any{
		super.convert(value);
		return value;
	}
}

// txs list response dto
export class TxListResDto extends BaseResDto{
	time:string;
  height: string;
  tx_hash:string;
  memo:string;
  status:number;
  log:string;
  complex_msg:boolean;
  type:string;
  from:string;
  to:string;
  coins:Array<any>;
  signer:string;
  events:Array<any>;
  msgs:Array<any>;
  signers:Array<any>;

  static getDisplayData(value:any){
  	let data:TxListResDto[] = [];
  	data = value.map((v:any)=>{
  		let v_copy:any = JSON.parse(JSON.stringify(v));
  		let tx:TxListResDto = {
  			time: v_copy.time,
				height: v_copy.height,
				tx_hash: v_copy.tx_hash,
				memo: v_copy.memo,
				status: v_copy.status,
				log: v_copy.log,
				complex_msg: v_copy.complex_msg,
				type: v_copy.type,
				from: v_copy.from,
				to: v_copy.to,
				coins: v_copy.coins,
				signer: v_copy.signer,
				events: v_copy.events,
				msgs: v_copy.msgs,
				signers: v_copy.signers,
  		};
  		return tx;
  	});
  	return data;
  }
}