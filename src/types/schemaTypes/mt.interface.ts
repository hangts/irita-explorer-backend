export interface IMtDenomStruct {
  denom_name?: string,
  denom_id?: string,
  creator?: string,
  owner?: string,
  issue_tx_time?: number,
  issue_tx_height?: number,
  issue_tx_hash?: string,
  latest_tx_time?: number,
  latest_tx_height?:number
  latest_tx_hash?: string,
}
