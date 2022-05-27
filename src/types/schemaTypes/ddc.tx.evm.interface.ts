export interface IDdcTxEvmStruct {
  time: number,
  height: number,
  tx_hash: string,
  memo: string,
  status: number,
  types: string[],
  signer: string,
  signers: string[],
  fee: object[],
  evm_datas: object[],
  ex_ddc_infos: object[]
}
