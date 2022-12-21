export interface IContractErc721Struct {
  symbol?: string,
  name?: string,
  contract_addr?: string,
  creator_contract_addr?: string,
  latest_evm_tx_hash:string,
  latest_tx_time?: number,
  latest_tx_height?:number
  latest_tx_hash?: string,
}
