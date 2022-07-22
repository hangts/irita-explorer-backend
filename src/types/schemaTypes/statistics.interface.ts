export interface StatisticsType {
  statistics_name: string;
  count: number;
  data: string;
  statistics_info: string;
  create_at: number;
  update_at: number;
}

//tx_all statistics_info struct
export interface AllTxStatisticsInfoType {
  record_height?: number;
  record_height_block_txs?: number;
}

//tx_msgs_all statistics_info struct
export interface AllMsgsStatisticsInfoType {
  record_height?: number;
  record_height_tx_msgs?: number;
}

//denom_all statistics_info struct
export interface AllDenomStatisticsInfoType {
  record_height?: number;
  record_height_denoms?: number;
}