import { Document } from 'mongoose';
export interface validatorsStruct {
  name?:String,
  pubkey?:String,
  power?:String,
  operator?:String,
  jailed?:Boolean,
  hash?: String;
}

export interface validators extends validatorsStruct, Document{

}
