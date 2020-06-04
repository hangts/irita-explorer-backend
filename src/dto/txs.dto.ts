// import { IsString, IsInt, Length , Min, Max, IsOptional, Equals} from 'class-validator';
import {BaseReqDto, BaseResDto, PagingReqDto} from './base.dto';
import {ApiError} from '../api/ApiResult';
import {ErrorCodes} from '../api/ResultCodes';
import constant from '../constant/constant';
//txs list request dto
export class TxListReqDto extends PagingReqDto{
	
	type: string;
  status: string;
  beginTime: string;
  endTime: string;

  static validate(value:any){
  	super.validate(value);
		if (value.status && value.status !=='1' && value.status !=='2') {
			throw new ApiError(ErrorCodes.InvalidParameter, 'status m ust be 1 or 2');
		}
	}

	static convert(value:any):any{
		super.convert(value);
		return value;
	}
}

// txs list response dto
export class TxResDto extends BaseResDto{
	time: string;
  height: string;
  tx_hash: string;
  memo: string;
  status: number;
  log: string;
  complex_msg: boolean;
  type: string;
  from: string;
  to: string;
  coins: Array<any>;
  signer: string;
  events: Array<any>;
  msgs: Array<any>;
  signers: Array<any>;

  constructor(txData){
  	super();
  	this.time = txData.time;
		this.height = txData.height;
		this.tx_hash = txData.tx_hash;
		this.memo = txData.memo;
		this.status = txData.status;
		this.log = txData.log;
		this.complex_msg = txData.complex_msg;
		this.type = txData.type;
		this.from = txData.from;
		this.to = txData.to;
		this.coins = txData.coins;
		this.signer = txData.signer;
		this.events = txData.events;
		this.msgs = txData.msgs;
		this.signers = txData.signers;
  }

  static bundleData(value:any):TxResDto[]{
  	let data:TxResDto[] = [];
  	data = value.map((v:any)=>{
  		return new TxResDto(v);
  	});
  	return data;
  }
}
