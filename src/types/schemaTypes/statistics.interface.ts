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