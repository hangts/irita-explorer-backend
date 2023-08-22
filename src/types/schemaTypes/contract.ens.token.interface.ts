export interface IContractEnsTokenStruct {
  contract_addr: string,
  token_id: string,
  parent_node: string,
  domain_name: string,
  label: string,
  owner: string,
  resolver: number,
  ttl: number,
  expiry: number,
  issue_tx_time: number,
  issue_tx_hash: string,
  issue_tx_height: number,
  issue_evm_tx_hash: string,
  create_time: number,
  update_time: number,
}