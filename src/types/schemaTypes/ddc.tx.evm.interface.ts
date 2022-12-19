export interface IDdcTxEvmStruct {
  time: number,
  height: number,
  tx_hash: string,
  evm_tx_hash: string,
  memo: string,
  status: number,
  types: string[],
  signer: string,
  contract_address: string,
  signers: string[],
  fee: object[],
  evm_datas: object[],
  ex_ddc_infos: object[]
}
