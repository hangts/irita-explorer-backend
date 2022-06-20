import { addressPrefix } from '../constant'
import {cfg} from '../config/config';
import { Logger } from '../logger';
//  todo: duanjie sdk待替换
let sdk = require('@irisnet/irishub-sdk');
let client = sdk
  .newClient({
      node: cfg.serverCfg.rpcAddr,
      chainNetwork: sdk.types.ChainNetwork.Iris,
      chainId: cfg.serverCfg.chainId,
  });

export function getConsensusPubkey(value) {
    if (sdk && sdk.utils && sdk.types) {
        let pk = sdk.utils.Crypto.aminoMarshalPubKey({
            type: sdk.types.PubkeyType.ed25519,
            value: value
        })
        let pk_bech32  = sdk.utils.Crypto.encodeAddress(pk, addressPrefix.icp);
        return pk_bech32
    }
    return ''
}

export async function globalAccountNumber() {
  try {
      const globalAccountNumber = client.tendermint.queryGlobalAccountNumber();
      return globalAccountNumber
  }catch (e) {
      Logger.warn(`sdk-error from queryGlobalAccountNumber`, e)
  }
}