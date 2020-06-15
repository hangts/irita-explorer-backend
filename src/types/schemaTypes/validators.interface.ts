export interface IValidatorsStruct {
  name?:string,
  pubkey?:string,
  power?:string,
  operator?:string,
  jailed?:boolean | string,
  hash?: string;
}

