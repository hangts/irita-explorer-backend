export interface IContractEnsReverseRegistrationStruct {
  contract_addr: string,
  addr: string,
  lower_addr: string,
  owner: string,
  resolver: string,
  name: string,
  is_valid_domain: number,
  latest_evm_tx_hash:string,
  latest_tx_time: number,
  latest_tx_height:number,
  latest_tx_hash: string,
  create_time: number,
  update_time: number,
}
