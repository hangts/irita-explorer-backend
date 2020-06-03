import { IsString, IsInt, Length , Min, Max, IsOptional, Equals} from 'class-validator';
import {BaseDot, PagingDot} from './base.dto';
import {ApiError} from '../api/ApiResult';
import {ErrorCodes} from '../api/ResultCodes';
import constant from '../constant/constant';

export class TxsReqDto extends PagingDot{
	
	type:string;
  status: string;
  beginTime:string;
  endTime:string;

  static validate(value:any){
		if (value.status && value.status !=='1' && value.status !=='2') {
			throw new ApiError(ErrorCodes.InvalidParameter, 'status must be 1 or 2');
		}
	}

	static convert(value:any){
		if (!value.pageNumber) {
			value.pageNumber = constant.defaultPaging.pageNumber;
		}
		if (!value.pageSize) {
			value.pageSize = constant.defaultPaging.pageSize;
		}
		return value;
	}
}


export class TxsResDot extends BaseDot{
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
  txn_revno:number;
  txn_queue:Array<any>;

  static getDisplayData(value:any){
  	let data:TxsResDot[] = [];
  	data = value.map((v:any)=>{
  		let v_copy:any = JSON.parse(JSON.stringify(v));
  		let tx:TxsResDot = {
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
				txn_revno: v_copy.txn_revno,
				txn_queue: v_copy.txn_queue
  		};
  		return tx;
  	});
  	return data;
  }
}