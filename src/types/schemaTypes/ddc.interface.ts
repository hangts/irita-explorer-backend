import { Document } from 'mongoose';
import { INftStruct } from './nft.interface';
export interface IDdcStruct {
  ddc_id?: number,
  ddc_type?: number,
  ddc_name?: string,
  ddc_symbol?: string,
  ddc_uri?: string,
  ddc_data?: string,
  contract_address?: string,
  creator?: string,
  owner?: string,
  amount?: number,
  last_tx_height?: number,
  last_tx_time?: number,
  is_delete?: boolean,
  is_freeze?: boolean,
  create_time?: number,
  update_time?: number
}

export interface IDdcMapStruct extends IDdcStruct{
  ddc_id?: number,
  ddc_name?: string,
  contract_address?: string,
}

export interface IDdc extends IDdcStruct,Document {

}