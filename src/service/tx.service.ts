import {DeepPagingReqDto} from './../dto/base.dto';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {ListStruct, Result} from '../api/ApiResult';
import {
  callServiceResDto,
  DeleteTxTypesReqDto,
  eTxListReqDto,
  ExternalQueryRespondServiceReqDto,
  ExternalQueryRespondServiceResDto,
  ExternalServiceResDto,
  IdentityTxReqDto,
  PostTxTypesReqDto,
  PutTxTypesReqDto,
  RespondServiceResDto,
  ServiceBindInfoReqDto,
  ServiceBindInfoResDto,
  ServiceListReqDto,
  ServiceProvidersReqDto,
  ServiceProvidersResDto,
  ServiceResDto,
  ServiceRespondReqDto,
  ServiceRespondResDto,
  ServicesDetailReqDto,
  ServiceTxReqDto,
  ServiceTxResDto,
  TxListReqDto,
  TxListWithAddressReqDto,
  TxListWithAssetReqDto,
  TxListWithCallServiceReqDto,
  TxListWithContextIdReqDto,
  TxListWithDdcReqDto,
  TxListWithHeightReqDto,
  TxListWithNftReqDto,
  TxListWithRespondServiceReqDto,
  TxListWithServicesNameReqDto,
  TxResDto,
  TxStatisticWithAddressReqDto,
  TxStatisticWithAddressResDto,
  TxTypeResDto,
  TxWithHashReqDto,
} from '../dto/txs.dto';
import {ExternalIBindTx, ExternalIServiceName, IBindTx, IServiceName} from '../types/tx.interface';
import {ITxsQuery, ITxStruct, ITxsWithAddressQuery, ITxsWithNftQuery} from '../types/schemaTypes/tx.interface';
import {getReqContextIdFromEvents, getServiceNameFromMsgs} from '../helper/tx.helper';
import Cache from '../helper/cache';
import {
    addressPrefix,
    ContractType,
    DDCType,
    defaultEvmTxReceiptErrlog,
    deFaultGasPirce, ERCType,
    proposal as proposalString,
    TxCntQueryCond,
    TxsListCountName,
    TxType,
} from '../constant';
import {addressTransform, splitString} from '../util/util';
import {GovHttp} from '../http/lcd/gov.http';
import {txListParamsHelper, TxWithAddressParamsHelper} from '../helper/params.helper';
import {getConsensusPubkey} from "../helper/staking.helper";
import {cfg} from "../config/config";
import {ContractErc20Schema} from "../schema/ContractErc20.schema";

@Injectable()
export class TxService {
    constructor(@InjectModel('Tx') private txModel: any,
        @InjectModel('TxType') private txTypeModel: any,
        @InjectModel('Denom') private denomModel: any,
        @InjectModel('Nft') private nftModel: any,
        @InjectModel('MtDenom') private mtDenomModel: any,
        @InjectModel('TxEvm') private txEvmModel: any,
        @InjectModel('EvmContractConfig') private evmContractCfgModel: any,
        @InjectModel('Identity') private identityModel: any,
        @InjectModel('StakingValidator') private stakingValidatorModel: any,
        @InjectModel('Proposal') private proposalModel: any,
        @InjectModel('Statistics') private statisticsModel: any,
        @InjectModel('Block') private blockModel: any,
        @InjectModel('ContractErc20') private ContractErc20Model: any,
        @InjectModel('ContractErc721') private ContractErc721Model: any,
        @InjectModel('ContractErc1155') private ContractErc1155Model: any,
        @InjectModel('ContractOther') private ContractOtherModel: any,
        private readonly govHttp: GovHttp
    ) {
        this.cacheTxTypes();
        //this.cacheEvmContract();
    }

    handleAcutalFee(tx) {
        if (tx?.type !== TxType.ethereum_tx) {
            return tx
        }
        if (tx.fee.amount.length === 1) {
            const actualFee = Number(tx.gas_used) * Number(deFaultGasPirce)
            if (actualFee) {
                tx.fee.amount[0].amount = `${actualFee}`
            }
        }
        return tx
    }


    async addMonikerToTxs(txList) {
        const validators = await this.stakingValidatorModel.queryAllValidators();
        const validatorMap = {};
        validators.forEach((item) => {
            validatorMap[item.operator_address] = item;
        });

        const txData = (txList || []).map((tx) => {
            tx = this.handleAcutalFee(tx)
            const item = JSON.parse(JSON.stringify(tx));
            let monikers = [];
            (item.addrs || []).forEach((addr) => {
                if (validatorMap[addr] &&
                    validatorMap[addr].description &&
                    validatorMap[addr].description.moniker) {
                    const moniker = {};
                    moniker[addr] = validatorMap[addr].is_black ? validatorMap[addr].moniker_m : validatorMap[addr].description.moniker;
                    monikers.push(moniker);
                }
            });
            item.monikers = monikers;
            item.statistics_msg_type = tx.statistics_msg_type
            item.extend = tx.extend
            return item;
        });
        return txData;
    }

    handerEvents(txList) {
        (txList).forEach(tx => {
            (tx.msgs || []).forEach((msg,index) => {
                if (msg.type === TxType.claim_htlc) {
                    (tx.events_new || []).forEach((eventNew) => {
                        if (eventNew.msg_index === index) {
                            let amount, recipient;
                            (eventNew.events || []).forEach(event => {
                                if(event.type === "transfer") {
                                    (event.attributes || []).forEach(item => {
                                        if(item.key === 'amount')  {
                                            amount = item.value
                                        }
                                        if(item.key === 'recipient') {
                                            recipient = item.value
                                        }
                                    })
                                }
                            })
                            msg.msg['amount'] = amount;
                            msg.msg['recipient'] = recipient;
                        }
                    })
                }
                if (msg.type === TxType.withdraw_delegator_reward) {
                    (tx.events_new || []).forEach((eventNew) => {
                        if (eventNew.msg_index === index) {
                            let amount;
                            (eventNew.events || []).forEach((item) => {
                                if(item.type === 'withdraw_rewards') {
                                    (item.attributes || []).forEach((attr) => {
                                        if (attr.key == 'amount') {
                                            amount = attr.value || '--';
                                        }
                                    });
                                }
                            });
                            msg.msg['amount'] = amount;
                        }
                    })
                }
                if(msg.type === TxType.call_service){
                    (tx.events_new || []).forEach((eventNew) => {
                        if (eventNew.msg_index === index) {
                            let requestContextId;
                            (eventNew.events || []).forEach(event => {
                                if(event.type === "create_context") {
                                    (event.attributes || []).forEach(item => {
                                        if(item.key === 'request_context_id')  {
                                            requestContextId = item.value
                                        }
                                    })
                                }
                            })
                            msg.msg['request_context_id'] = requestContextId;
                        }
                    })
                }
                if(msg.type === TxType.respond_service){
                    (tx.events_new || []).forEach((eventNew) => {
                        if (eventNew.msg_index === index) {
                            let serviceName;
                            (eventNew.events || []).forEach(event => {
                                if(event.type === "respond_service") {
                                    (event.attributes || []).forEach(item => {
                                        if(item.key === 'service_name')  {
                                            serviceName = item.value
                                        }
                                    })
                                }
                            })
                            msg.msg['service_name'] = serviceName;
                        }
                    })
                }
                if(msg.type === TxType.create_client
                    ||  msg.type === TxType.connection_open_confirm
                    ||  msg.type === TxType.connection_open_ack) {
                    (tx.events_new || []).forEach((eventNew) => {
                        if (eventNew.msg_index === index) {
                            let clientId;
                            (eventNew.events || []).forEach(event => {
                                if(event.type === "create_client"
                                    || event.type === "connection_open_confirm"
                                    || event.type === "connection_open_ack") {
                                    (event.attributes || []).forEach(item => {
                                        if(item.key === 'client_id')  {
                                            clientId = item.value
                                        }
                                    })
                                }
                            })
                            msg.msg['client_id'] = clientId;
                        }
                    })
                }
                if(msg.type === TxType.channel_open_init
                    || msg.type === TxType.channel_open_try){
                    (tx.events_new || []).forEach((eventNew) => {
                        if (eventNew.msg_index === index) {
                            let channelId;
                            (eventNew.events || []).forEach(event => {
                                if(event.type === "channel_open_init" || event.type === "channel_open_try") {
                                    (event.attributes || []).forEach(item => {
                                        if(item.key === 'channel_id')  {
                                            channelId = item.value
                                        }
                                    })
                                }
                            })
                            msg.msg['channel_id'] = channelId;
                        }
                    })
                }
                if(msg.type === TxType.connection_open_init || msg.type === TxType.connection_open_try){
                    (tx.events_new || []).forEach((eventNew) => {
                        if (eventNew.msg_index === index) {
                            let connectionId;
                            (eventNew.events || []).forEach(event => {
                                if(event.type === "connection_open_init" || event.type === "connection_open_try" ) {
                                    (event.attributes || []).forEach(item => {
                                        if(item.key === 'connection_id')  {
                                            connectionId = item.value
                                        }
                                    })
                                }
                            })
                            msg.msg['connection_id'] = connectionId;
                        }
                    })
                }
                if(msg.type === TxType.add_liquidity || msg.type=== TxType.swap_order || msg.type === TxType.remove_liquidity){
                    (tx.events_new || []).forEach((eventNew) => {
                        if (eventNew.msg_index === index) {
                            let swapAddLiudityAmount = [];
                            (eventNew.events || []).forEach(event => {
                                if(event.type === "transfer") {
                                    (event.attributes || []).forEach(item => {
                                        if(item.key === 'amount')  {
                                            swapAddLiudityAmount.push(item.value)
                                        }
                                    })
                                }
                            })
                            msg.msg['swap_amount'] = swapAddLiudityAmount;
                        }
                    })
                }
            });
            tx.events_new = undefined;
        });
        return txList
    }
    async addContractMethodToTxs(txList) {
          let txHashes = []
          for (const tx of txList) {
            txHashes.push(tx.tx_hash)
          }
          const txEvms = await this.txEvmModel.findEvmTxsByHashes(txHashes)
          let mapEvmContract = new Map()
          let EvmContract = new Map()
          let txHashMap = new Map()
          //let currentTxHashMap = new Map()
          if (!txEvms?.length) {
            return txList
          }
          let contractAddrs = []
          for( const evmTx of txEvms) {
            if (evmTx.contract_address) {
                contractAddrs.push(evmTx.contract_address)
            }
            if (evmTx?.evm_datas?.length){
              for (const data of evmTx.evm_datas) {
                if (data?.evm_tx_hash) {
                    mapEvmContract.set(data.evm_tx_hash, data)
                    contractAddrs.push(data.contract_address)
                }
              }
              if (evmTx?.evm_tx_hash) {
                  EvmContract.set(evmTx.evm_tx_hash, evmTx)
              }
              txHashMap.set(evmTx.tx_hash, evmTx)
            }
          }

          //查配置表
        const evmConfigs = await this.evmContractCfgModel.queryAllByContractAddr(contractAddrs)
        let erc20Addr = [], erc721Addr = [], erc1155Addr = [], allAddr = []
        evmConfigs.forEach(item => {
              switch (item.contract_type) {
                  case ERCType.erc20:
                      erc20Addr.push(item.contract_addr)
                      break
                  case ERCType.erc721:
                      erc721Addr.push(item.contract_addr)
                      break
                  case ERCType.erc1155:
                      erc1155Addr.push(item.contract_addr)
                      break
                  case ERCType.all:
                      allAddr.push(item.contract_addr)
                      break
              }
        })

        const contractMap = new Map();
        if (erc20Addr.length){
            const erc20List = await this.ContractErc20Model.findListInContractAddrs(erc20Addr)
            erc20List.forEach(item => contractMap.set(item.contract_addr, item.name))
        }

        if (erc721Addr.length){
            const erc721List = await this.ContractErc721Model.findListInContractAddrs(erc721Addr)
            erc721List.forEach(item => contractMap.set(item.contract_addr, item.name))
        }

        if (erc1155Addr.length){
            const erc1155List = await this.ContractErc1155Model.findListInContractAddrs(erc1155Addr)
            erc1155List.forEach(item => contractMap.set(item.contract_addr, item.name))
        }

        if (allAddr.length){
            const otherList = await this.ContractOtherModel.findListInContractAddrs(allAddr)
            otherList.forEach(item => contractMap.set(item.contract_addr, item.name))
        }


      return (txList || []).map((tx) => {
            if (tx.msgs?.length) {
              tx.msgs?.forEach((msg, index) => {
                if (msg.type === TxType.ethereum_tx) {
                    msg.msg.ex = {}
                    if (mapEvmContract.has(msg?.msg?.hash) || EvmContract.has(msg?.msg?.hash)) {
                    const evmData = mapEvmContract.get(msg?.msg?.hash)
                    const evm = EvmContract.get(msg?.msg?.hash)
                    //msg.msg.ex['ddc_method'] = evmData?.evm_method
                    if (evmData?.evm_method) {
                        msg.msg.ex['method'] = evmData?.evm_method
                        msg.msg.ex['contract_name'] = contractMap[evmData?.contract_address] ? contractMap[evmData?.contract_address] : evmData?.contract_address.substr(0,12)
                        msg.msg.ex['address'] = evmData?.contract_address
                    }else if (evm?.evm_datas[0].input_data) {
                        if (evm?.evm_datas[0].input_data.name == "") {
                            msg.msg.ex['method'] = evm?.evm_datas[0].input_data.id
                        } else {
                            msg.msg.ex['method'] = evm?.evm_datas[0].input_data.name
                        }
                        msg.msg.ex['contract_name'] = contractMap[evm?.contract_address] ? contractMap[evm?.contract_address] : evm?.contract_address.substr(0,12)
                        msg.msg.ex['address'] = evm?.contract_address
                    } else {
                        msg.msg.ex['method'] = "Ethereum_Tx"
                        msg.msg.ex['contract_name'] = contractMap[evm?.contract_address] ? contractMap[evm?.contract_address] : evm?.contract_address.substr(0,12)
                        msg.msg.ex['address'] = evm?.contract_address
                    }
                  }
                }
              })
            }else {
                if (tx.type === TxType.ethereum_tx){
                    let msgObj = {}
                    msgObj['msg'] = {}
                    msgObj['type'] =  TxType.ethereum_tx
                    tx.msgs = []
                    if (txHashMap.has(tx.tx_hash)) {
                        const evmTx = txHashMap.get(tx.tx_hash);
                        if (evmTx?.evm_datas?.evm_method) {
                            let ex = {},msg = {}
                            ex['method'] = evmTx.evm_datas?.evm_method
                            msg['ex'] = ex
                            msgObj['msg'] = msg
                        } else if (evmTx?.evm_datas[0].input_data) {
                            let ex = {},msg = {}
                            if (evmTx?.evm_datas[0].input_data.name == "") {
                               ex['method'] = evmTx?.evm_datas[0].input_data.id
                            } else {
                                ex['method'] = evmTx?.evm_datas[0].input_data.name
                            }
                            msg['ex'] = ex
                            msgObj['msg'] = msg
                        }
                        tx.msgs.push(msgObj)
                    }
                }
            }
            return tx
          })
      }
    async addDdcInfoToTxResDTo(txEvms, map) {
      if (!txEvms?.length) {
        return txEvms
      }
      for( const evmTx of txEvms) {
        evmTx.contract_addrs = []
        evmTx.msgs = []
        if (evmTx.fee.amount.length === 1) {
          const txInfo = map.get(evmTx.tx_hash)
          const actualFee = Number(txInfo.gas_used) * Number(deFaultGasPirce)
          if (actualFee) {
              evmTx.fee.amount[0].amount = `${actualFee}`
          }
        }

        if (evmTx?.evm_datas?.length){
          for (const data of evmTx.evm_datas) {
              evmTx.contract_addrs.push(data?.contract_address)
              evmTx.msgs.push({
                  "type" : TxType.ethereum_tx,
                  "msg" : {
                      "ex":{
                          "ddc_method":data?.evm_method
                      },
                  }
              })
          }
        }
        if (evmTx?.types?.length) {
            evmTx.type = evmTx.types[0]
        }
      }
      return txEvms
    }
    async cacheTxTypes() {
        const txTypes = await this.txTypeModel.queryTxTypeList();
        Cache.supportTypes = txTypes.map((item) => item.type_name);
    }
    async cacheEvmContract() {
        const evmConfigs = await this.evmContractCfgModel.queryAllContractCfgs();
        for (const one of evmConfigs) {
            if (one?.address) {
                Cache.supportEvmTypeAddr.set(one.type,one.address)
                Cache.supportEvmAddrType.set(one.address,one.type)
            }
        }
    }
    // txs
    async queryTxList(query: TxListReqDto): Promise<ListStruct<TxResDto[]>> {
        // if (!Cache.supportTypes || !Cache.supportTypes.length) {
        const {txId, limit, useCount, type, countMsg } = query;
        let txListData, txData = [], count = null, totalTxMsgs = null;
        if(limit || useCount || countMsg){
          await this.cacheTxTypes();
            let queryDb: ITxsQuery = {
                type: type,
                status: query.status,
                address: query.address,
                useCount: useCount,
                beginTime: query.beginTime,
                endTime: query.endTime,
                txId: txId,
                limit: limit,
            }
            //search contract_address when type is ethereum_tx
            if (type && type.includes(ERCType.contractTag)) {
                const evmConfigs = await this.evmContractCfgModel.queryAllContractCfgs();
                let typeArr = type.split(",");
                if (typeArr.length > 1) {
                    //查询全部
                    if (evmConfigs) {
                        let addrs = [];
                        evmConfigs.forEach(item => {
                            if (item.contract_addr) {
                                addrs.push(item.contract_addr)
                            }
                        })
                        //const addrs:string[] = evmConfigs.map((item) => item?.contract_addr)
                        if (addrs && addrs.length) {
                            queryDb.contract_addr = addrs.join(",");
                        }
                    }
                } else {
                    const ercType = ContractType[type]
                    let addrs = [];
                    evmConfigs.forEach(item => {
                        if (item.contract_type == ercType && item.contract_addr) {
                            addrs.push(item.contract_addr)
                        }
                    })
                    if (addrs && addrs.length) {
                        queryDb.contract_addr = addrs.join(",");
                    }
                }
            }


           /* if (type && type.includes(DDCType.contractTag)) {
                await this.cacheEvmContract();
                // queryDb.type = TxType.ethereum_tx
                const ddcType = ContractType[type]
                if (ddcType) {
                    if (ddcType > 0) {
                        queryDb.contract_addr = Cache.supportEvmTypeAddr.get(ddcType)
                    } else { //other contract
                        const evmConfigs = await this.evmContractCfgModel.queryAllContractCfgs();
                        if (evmConfigs) {
                          const addrs:string[] = evmConfigs.map((item) => item?.address)
                          if (addrs && addrs.length) {
                            queryDb.contract_addr = addrs.join(",");
                          }
                        }
                    }
                } else {
                    return new ListStruct([], Number(query.pageNum), Number(query.pageSize), 0);
                }
            }*/

          if(limit){
              if (query.beginTime && query.beginTime.length) {
                  const startHeight = await this.blockModel.findMinBlockWithTime(query.beginTime, query.endTime);
                  if (startHeight === 0){
                      return new ListStruct([], Number(query.pageNum), Number(query.pageSize), 0);
                  }
                  queryDb.beginTxId = String(startHeight * 100000)
              }

              if (query.endTime && query.endTime.length) {
                  if (new Date(Number(query.endTime)*1000).toDateString() != new Date().toDateString()){
                      const endHeight = await this.blockModel.findMaxBlockWithTime(query.beginTime,query.endTime);
                      if (endHeight === 0){
                          return new ListStruct([], Number(query.pageNum), Number(query.pageSize), 0);
                      }
                      queryDb.endTxId = String(endHeight * 100000 + 99999)
                  }
              }

            txListData = await this.txModel.queryTxList(queryDb);
            if (txListData.data && txListData.data.length > 0) {
                txListData.data = this.handerEvents(txListData.data)
                txListData.data = this.handleMsg(txListData.data, queryDb)
                // add evm info about contract method
                txListData.data = await this.addContractMethodToTxs(txListData.data)
                txData = await this.addMonikerToTxs(txListData.data);
            }
          }
          const countCalls = []
          if(useCount){
            if (!query?.beginTime && !query?.endTime && !query?.address && !query?.status && !query?.type) {
              //default count with no filter conditions
              const txCnt = await this.statisticsModel.findStatisticsRecord(TxsListCountName.txAll)
              count = txCnt?.count
            }else if (!query?.beginTime && !query?.endTime && !query?.address && !query?.type) {
              //default count with only status filter conditions
              count = await this.queryStatusStatistic(query.status,false,useCount)
            } else {
                if (countMsg) {
                    countCalls.push(this.txModel.queryTxListCount(queryDb));
                }else{
                    count = await this.txModel.queryTxListCount(queryDb);
                }
            }
          }
          if (countMsg) {
            if (!query?.beginTime && !query?.endTime && !query?.address && !query?.status && !query?.type) {
              //default count with no filter conditions
              const msgsCnt = await this.statisticsModel.findStatisticsRecord(TxsListCountName.txMsgsAll)
              totalTxMsgs = msgsCnt?.count
            }else if (!query?.beginTime && !query?.endTime && !query?.address && !query?.type) {
              //default count with only status filter conditions
              totalTxMsgs = await this.queryStatusStatistic(query.status,countMsg,false)
            } else {
              const queryParameters = txListParamsHelper(queryDb)
              if (useCount) {
                  countCalls.push(this.txModel.queryTxMsgsCountWithCond(queryParameters));
              }else{
                  const msgCntData = await this.txModel.queryTxMsgsCountWithCond(queryParameters)
                  if (msgCntData && msgCntData.length) {
                    totalTxMsgs = msgCntData[0].count
                  }
              }

            }
          }
          if ( countCalls.length === 2 && countMsg && useCount ) {
            const [countTx,msgCntData] = await Promise.all(countCalls);
            if (msgCntData && msgCntData.length) {
              totalTxMsgs = msgCntData[0].count
            }
            if (Number(countTx)) {
              count = countTx
            }
          }
        }


        return new ListStruct(TxResDto.bundleData(txData), Number(query.pageNum), Number(query.pageSize), count,null, totalTxMsgs);
    }

    async queryStatusStatistic(status: string,countMsg: boolean ,useCount: boolean): Promise<number> {
      if (status && status.length) {
        switch (status) {
          case '1': //success
            if (countMsg) {
              const msgsCnt = await this.statisticsModel.findStatisticsRecord(TxsListCountName.txMsgsAllSuccess)
              return  msgsCnt?.count
            }
            if (useCount) {
              const txsCnt = await this.statisticsModel.findStatisticsRecord(TxsListCountName.txAllSuccess)
              return  txsCnt?.count
            }
            break;
          case '2': //failed
            if (countMsg) {
              const msgsCnt = await this.statisticsModel.findStatisticsRecord(TxsListCountName.txMsgsAllFailed)
              return  msgsCnt?.count
            }
            if (useCount) {
              const txsCnt = await this.statisticsModel.findStatisticsRecord(TxsListCountName.txAllFailed)
              return  txsCnt?.count
            }
            break;
        }
      }
      return 0
    }

    // txs/staking
    async queryStakingTxList(query: TxListReqDto): Promise<ListStruct<TxResDto[]>> {
        const { txId, limit, useCount } = query;
        let txListData , txData = [], count = null;

        if(limit || useCount){
          await this.cacheTxTypes();

          if(limit){
            txListData = await this.txModel.queryStakingTxList(query);
            if (txListData.data && txListData.data.length > 0) {
                txListData.data = this.handerEvents(txListData.data)
            }
            txData = await this.addMonikerToTxs(txListData.data);
          }
          if(useCount){
            count = await this.txModel.queryStakingTxListCount(query);
          }
        }
        return new ListStruct(TxResDto.bundleData(txData), Number(query.pageNum), Number(query.pageSize), count);
    }

    // txs/coinswap
    async queryCoinswapTxList(query: TxListReqDto): Promise<ListStruct<TxResDto[]>> {
      const { pageNum, pageSize, useCount } = query;
      let txListData, txData = [],count = null;

      if(pageNum && pageSize){
        txListData = await this.txModel.queryCoinswapTxList(query);
        txData = txListData?.data
      }
      if(useCount){
        count = await this.txModel.queryCoinswapTxListCount(query);
      }
      return new ListStruct(TxResDto.bundleData(txData), Number(query.pageNum), Number(query.pageSize), count);
    }

    // txs/declaration
    async queryDeclarationTxList(query: TxListReqDto): Promise<ListStruct<TxResDto[]>> {
        // if (!Cache.supportTypes || !Cache.supportTypes.length) {
        const { txId, limit, useCount } = query;
        let txListData, txData = [],count = null;

        if(limit || useCount){
          await this.cacheTxTypes();

          if(limit){
            txListData = await this.txModel.queryDeclarationTxList(query);
            txData = await this.addMonikerToTxs(txListData.data);
          }
          if(useCount){
            count = await this.txModel.queryDeclarationTxListCount(query);
          }
        }
        // }
        return new ListStruct(TxResDto.bundleData(txData), Number(query.pageNum), Number(query.pageSize), count);
    }

    // txs/gov
    async queryGovTxList(query: TxListReqDto): Promise<ListStruct<TxResDto[]>> {
        // if (!Cache.supportTypes || !Cache.supportTypes.length) {
        const { txId, limit, useCount } = query;
        let txListData, txData = [], txList = [], count = null;

        if(limit){
          await this.cacheTxTypes();

          if(limit){
            if (query.address) {
              query.address = addressTransform(query.address, addressPrefix.iaa)
            }
            txListData = await this.txModel.queryGovTxList(query);
            const proposalsData = await this.proposalModel.queryAllProposalsSelect();
            const proposalsMap = new Map();
            if (proposalsData && proposalsData.length > 0) {
                proposalsData.forEach(proposal => {
                    proposal.content.id = proposal.id;
                    proposal.content.proposal_link = !proposal.is_deleted
                    proposalsMap.set(proposal.id, proposal.content);
                });
            }
            if (txListData && txListData.data && txListData.data.length > 0) {
                txList = txListData.data.map(async tx => {
                    const item = JSON.parse(JSON.stringify(tx));
                    const msgs = item && item.msgs && item.msgs[0];
                    const events = item.events
                    if (msgs.type == TxType.vote || msgs.type == TxType.deposit) {
                        const ex = proposalsMap.get(msgs.msg.proposal_id);
                        item.ex = ex;
                        return item
                    } else {
                        let proposal_id;
                        events.forEach(event => {
                            if (event.type == TxType.submit_proposal) {
                                event.attributes.forEach(element => {
                                    if (element.key == 'proposal_id') {
                                        proposal_id = element.value
                                    }
                                });
                            }
                        });
                        let ex = proposalsMap.get(Number(proposal_id));
                        if (!ex) {
                            const proposal = await this.govHttp.getProposalById(proposal_id);
                            const id = proposal && proposal.id;
                            let type = proposal && proposal.content && proposal.content['@type'] && proposal.content['@type']
                            type ? type = splitString(type, '.').replace(proposalString, '') : '';
                            const title = proposal && proposal.content && proposal.content['title']
                            ex = { id, type, title }
                            item.proposal_link = false
                        }
                        item.ex = ex;
                        return item
                    }
                });
            }
            txList = await Promise.all(txList)
            txData = await this.addMonikerToTxs(txList);
          }
        }
        if(useCount){
          count = await this.txModel.queryGovTxListCount(query);
        }
        // }

        return new ListStruct(TxResDto.bundleData(txData), Number(query.pageNum), Number(query.pageSize), count);
    }

    // txs/e  供edgeServer调用  返回数据不做过滤
    async queryTxListEdge(query: eTxListReqDto): Promise<ListStruct<any[]>> {
      const { pageSize, useCount } = query;
      let txListData, txData = [],count = null;

      if(pageSize){
        txListData = await this.txModel.queryTxListEdge(query.types, query.height, query.pageNum, query.pageSize, query.status, query.address, query.include_event_addr);
        txData = [...txListData.data];
        if (txListData.data && txListData.data.length && txListData.data.length == query.pageSize) {
            const lastItem = txListData.data[txListData.data.length - 1];
            const lastHeightTxData = await this.txModel.queryTxListByHeightEdge(lastItem.height, 1, 10000,false,query.status);
            txData = txData.filter((item)=>item.height != lastItem.height).concat(lastHeightTxData.data);

        }
      }
      if(useCount){
        count = await this.txModel.queryTxListEdgeCount(query.types, query.height, query.status, query.address, query.include_event_addr);
      }

      return new ListStruct(txData, Number(query.pageNum), Number(query.pageSize), count);
    }

    // txs/blocks
    async queryTxWithHeight(query: TxListWithHeightReqDto): Promise<ListStruct<TxResDto[]>> {
      const { limit, useCount } = query;
      let txListData, txData = [],count = null;

      if(limit || useCount){
        await this.cacheTxTypes();

        if(limit){
          txListData = await this.txModel.queryTxWithHeight(query);
          txListData.data = await this.addMonikerToTxs(txListData.data);
          txData = await this.addContractMethodToTxs(txListData.data);
        }
        if(useCount){
          count = await this.txModel.queryTxWithHeighCount(query);
        }
      }
      return new ListStruct(TxResDto.bundleData(txData), Number(query.pageNum), Number(query.pageSize), count);
    }

    //  txs/addresses
    async queryTxWithAddress(query: TxListWithAddressReqDto): Promise<ListStruct<TxResDto[]>> {
      const { txId, limit, useCount, type } = query;
      let txListData, txData = [];
      if(limit || useCount){
        await this.cacheTxTypes();
          let queryDb: ITxsWithAddressQuery = {
              type: type,
              status: query.status,
              address: query.address,
              useCount: useCount,
              txId: txId,
              limit: limit,
          }
          //search contract_address when type is ethereum_tx
          if (type && type.includes(ERCType.contractTag)) {
              //await this.cacheEvmContract();
              // queryDb.type = TxType.ethereum_tx
              /*const ddcType = ContractType[type]
              if (ddcType) {
                  if (ddcType > 0) {
                      queryDb.contract_addr = Cache.supportEvmTypeAddr.get(ddcType)
                  } else { //other contract
                    const evmConfigs = await this.evmContractCfgModel.queryAllContractCfgs();
                    if (evmConfigs) {
                      const addrs:string[] = evmConfigs.map((item) => item?.address)
                      if (addrs && addrs.length) {
                        queryDb.contract_addr = addrs.join(",");
                      }
                    }
                  }
              } else {
                  return new ListStruct([], Number(query.pageNum), Number(query.pageSize), 0);
              }*/
              const evmConfigs = await this.evmContractCfgModel.queryAllContractCfgs();
              let typeArr = type.split(",");
              if (typeArr.length > 1) {
                  //查询全部
                  if (evmConfigs) {
                      const addrs:string[] = evmConfigs.map((item) => item?.contract_addr)
                      if (addrs && addrs.length) {
                          queryDb.contract_addr = addrs.join(",");
                      }
                  }
              } else {
                  const ercType = ContractType[type]
                  let addrs = [];
                  evmConfigs.forEach(item => {
                      if (item.contract_type == ercType && item.contract_addr) {
                          addrs.push(item.contract_addr)
                      }
                  })
                  if (addrs && addrs.length) {
                      queryDb.contract_addr = addrs.join(",");
                  }
              }
          }

        if(limit){
          txListData = await this.txModel.queryTxWithAddress(queryDb);
          if (txListData.data && txListData.data.length > 0) {
              txListData.data = this.handerEvents(txListData.data);
              // add evm info about contract method
              txListData.data = await this.addContractMethodToTxs(txListData.data)
              txData = await this.addMonikerToTxs(txListData.data);
          }
        }
        // const countCalls = []
        // if(useCount){
        //     if (countMsg) {
        //       countCalls.push(this.txModel.queryTxWithAddressCount(queryDb));
        //     }else{
        //        count = await this.txModel.queryTxWithAddressCount(queryDb);
        //     }
        // }
        // if (countMsg) {
        //     const queryParameters = await TxWithAddressParamsHelper(queryDb)
        //     if (useCount) {
        //       countCalls.push(this.txModel.queryTxMsgsCountWithCond(queryParameters));
        //     }else{
        //         const txMsgsData = await this.txModel.queryTxMsgsCountWithCond(queryParameters);
        //         if (txMsgsData && txMsgsData.length) {
        //           totalTxMsgs = txMsgsData[0].count
        //         }
        //     }
        // }

        // if ( countCalls.length === 2 && countMsg && useCount ) {
        //   const [countTx,msgCntData] = await Promise.all(countCalls);
        //   if (msgCntData && msgCntData.length) {
        //     totalTxMsgs = msgCntData[0].count
        //   }
        //   if (Number(countTx)) {
        //     count = countTx
        //   }
        // }
      }

      return new ListStruct(TxResDto.bundleData(txData), Number(query.pageNum), Number(query.pageSize), 0,null,0);
    } //  txs/addresses

    //  txs/addresses/statistic
    async queryTxStatisticWithAddress(query: TxStatisticWithAddressReqDto): Promise<TxStatisticWithAddressResDto> {
      const { params,address } = query;
      let data= {recv_txs_count:0,send_txs_count:0};
      if (params) {
          const codes = params.split(",")
          for (const code of codes) {
              switch (code) {
                  case '199':
                      const datas:number[] = await Promise.all([
                          this.txModel.queryRecvTxsCntWithAddress(address, TxCntQueryCond.nftQueryCnt),
                          this.txModel.queryRecvTxsCntWithAddress(address, TxCntQueryCond.sendQueryCnt),
                          this.txModel.queryRecvTxsCntWithAddress(address, TxCntQueryCond.multisendQueryCnt),
                      ]);
                      if (datas && datas?.length) {
                          for (const one of datas) {
                              if (Number(one)) {
                                  data.recv_txs_count += Number(one)
                              }
                          }
                      }
                      break;
                  case '198':
                      data.send_txs_count = await this.txModel.querySendTxsCntWithAddress(address)
                      break;
              }
          }

      }
      return new TxStatisticWithAddressResDto(data);
    }

    //  txs/relevance
    async queryTxWithContextId(query: TxListWithContextIdReqDto): Promise<ListStruct<TxResDto[]>> {
      const { pageNum, pageSize, useCount } = query;
      let txListData, txData = [],count = null;
      if(pageNum && pageSize || useCount){
        await this.cacheTxTypes();

        if(pageNum && pageSize){
          txListData = await this.txModel.queryTxWithContextId(query);
          txData = await this.addMonikerToTxs(txListData.data);
        }
        if(useCount){
          count = await this.txModel.queryTxWithContextIdCount(query);
        }
      }
      return new ListStruct(TxResDto.bundleData(txData), Number(query.pageNum), Number(query.pageSize), count);
    }

    //  txs/nfts
    async queryTxWithNft(query: TxListWithNftReqDto): Promise<ListStruct<TxResDto[]>> {
      const { txId, limit, pageNum, pageSize, denomId, tokenId, useCount } = query;
      let txListData, txData = [],count = null;
      if (pageNum && pageSize || limit){
        let queryDb: ITxsWithNftQuery = {
            txId: txId,
            limit: limit,
            denomId: denomId,
            tokenId: tokenId,
            pageNum: `${pageNum}`,
            pageSize: `${pageSize}`,
            useCount: useCount,
        }
        if (limit){
            txListData = await this.txModel.queryTxWithNftAndTxId(queryDb);
        }
        if(pageNum && pageSize){
            txListData = await this.txModel.queryTxWithNft(query);
        }
        txData = await this.addMonikerToTxs(txListData.data);
      }
      if(useCount){
        count = await this.txModel.queryTxWithNftCount(query);
      }

      return new ListStruct(TxResDto.bundleData(txData), Number(query.pageNum), Number(query.pageSize), count);
    }

    //  txs/ddcs
    async queryTxWithDdc(query: TxListWithDdcReqDto): Promise<ListStruct<TxResDto[]>> {
      const { pageNum, pageSize, useCount } = query;
      let txEvmListData, txListData, txData = [],count = null;
      const txMap = new Map<string, any>();
      if(pageNum && pageSize){
        txEvmListData = await this.txEvmModel.queryTxWithDdc(query);
        if (txEvmListData.data && txEvmListData.data.length > 0) {
            const hashs:string[] = txEvmListData.data.map((item) => item?.tx_hash)
            txListData = await this.txModel.queryTxWithHashs(hashs)
            txListData.forEach(item => txMap.set(item.tx_hash, item))
        }
        txData = await this.addDdcInfoToTxResDTo(txEvmListData.data, txMap);
      }
      if(useCount){
        count = await this.txEvmModel.queryTxWithDdcCount(query);
      }

      return new ListStruct(TxResDto.bundleData(txData), Number(query.pageNum), Number(query.pageSize), count);
    }

    //search ex_tx_evm with address for evm txs
    // async queryTxWithDdcAddr(query): Promise<ListStruct<TxResDto[]>> {
    //     const { pageNum, pageSize, useCount } = query;
    //     let txListData, txData = [],count = null;
    //     if(pageNum && pageSize){
    //         txListData = await this.txEvmModel.queryTxWithDdcAddr(query);
    //         txData = await this.addContractAddrsToEvmTxs(txListData.data);
    //     }
    //     if(useCount){
    //         count = await this.txEvmModel.queryTxWithDdcAddrCount(query);
    //     }
    //
    //     return new ListStruct(TxResDto.bundleData(txData), Number(query.pageNum), Number(query.pageSize), count);
    // }

    //废弃
    async queryTxWithServiceName(query: TxListWithServicesNameReqDto): Promise<ListStruct<TxResDto[]>> {
        await this.cacheTxTypes();
        const txListData = await this.txModel.queryTxWithServiceName(query);
        const txData = await this.addMonikerToTxs(txListData.data);
        return new ListStruct(TxResDto.bundleData(txData), Number(query.pageNum), Number(query.pageSize), txListData.count);
    }

    //  txs/services/call-service
    async queryTxWithCallService(query: TxListWithCallServiceReqDto): Promise<ListStruct<callServiceResDto[]>> {
      const { txId, limit, useCount } = query;
      let txListData, txData = [], count = null;

      if(limit){
        txListData = await this.txModel.queryCallServiceWithConsumerAddr(query.consumerAddr, txId, limit);
        if (txListData.data && txListData.data.length > 0) {
          for (const item of txListData.data) {
              const context_id: string = getReqContextIdFromEvents(item.events);
              if (context_id && context_id.length) {
                  const respond = await this.txModel.queryRespondServiceWithContextId(context_id);
                  item.respond = respond || [];
              } else {
                  item.respond = [];
              }
          }
        }
        txData = txListData.data
      }
      if(useCount){
        count = await this.txModel.queryCallServiceWithConsumerAddrCount(query.consumerAddr);
      }

      return new ListStruct(callServiceResDto.bundleData(txData), Number(query.pageNum), Number(query.pageSize), count);
    }

    //  txs/services/respond-service
    async queryTxWithRespondService(query: TxListWithRespondServiceReqDto): Promise<ListStruct<TxResDto[]>> {
      const { txId, limit, useCount } = query;
      let txListData, txData = [], count = null;

      if(limit){
        txListData = await this.txModel.queryBindServiceWithProviderAddr(query.providerAddr, query.txId, query.limit);
        if (txListData.data && txListData.data.length > 0) {
          for (const item of txListData.data) {
            const serviceName: string = getServiceNameFromMsgs(item.msgs);
            item.respond_times = 0;
            item.unbinding_time = 0;
            if (serviceName && serviceName.length) {
                const respond_times = await this.txModel.queryRespondCountWithServceName(serviceName, query.providerAddr);
                const disableTxs = await this.txModel.querydisableServiceBindingWithServceName(serviceName, query.providerAddr);
                item.respond_times = respond_times;
                if (disableTxs && disableTxs.length) {
                    item.unbinding_time = disableTxs[0].time;
                }
            }
          }
        }
        txData = txListData.data
      }
      if(useCount){
        count = await this.txModel.queryBindServiceWithProviderAddrCount(query.providerAddr);
      }

      return new ListStruct(RespondServiceResDto.bundleData(txData), Number(query.pageNum), Number(query.pageSize), count);
    }

    //  txs/services/detail/{serviceName}
    async queryTxDetailWithServiceName(query: ServicesDetailReqDto): Promise<TxResDto> {
        let result: TxResDto | null = null;
        const txData = await this.txModel.queryTxDetailWithServiceName(query.serviceName);
        if (txData) {
            result = new TxResDto(txData);
        }
        return result;
    }

    //  txs/types
    async queryTxTypeList(): Promise<Result<TxTypeResDto[]>> {
      const txTypeListData = await this.txTypeModel.queryTxTypeList();
      return new Result(TxTypeResDto.bundleData(txTypeListData));
    }

    // txs/types/service
    async queryServiceTxTypeList(): Promise<ListStruct<TxTypeResDto[]>> {
        const txTypeListData = await this.txTypeModel.queryServiceTxTypeList();
        return new ListStruct(TxTypeResDto.bundleData(txTypeListData), Number(0), Number(0));
    }

    // txs/types/staking
    async queryStakingTxTypeList(): Promise<ListStruct<TxTypeResDto[]>> {
        const txTypeListData = await this.txTypeModel.queryStakingTxTypeList();
        return new ListStruct(TxTypeResDto.bundleData(txTypeListData), Number(0), Number(0));
    }

    // txs/types/declaration
    async queryDeclarationTxTypeList(): Promise<ListStruct<TxTypeResDto[]>> {
        const txTypeListData = await this.txTypeModel.queryDeclarationTxTypeList();
        return new ListStruct(TxTypeResDto.bundleData(txTypeListData), Number(0), Number(0));
    }

    //  post txs/types
    async insertTxTypes(prarms: PostTxTypesReqDto): Promise<ListStruct<TxTypeResDto[]>> {
        const txTypeListData = await this.txTypeModel.insertTxTypes(prarms.typeNames);
        this.cacheTxTypes();
        return new ListStruct(TxTypeResDto.bundleData(txTypeListData), Number(0), Number(0));
    }

    //  put txs/types
    async updateTxType(prarms: PutTxTypesReqDto): Promise<TxTypeResDto> {
        let result: TxTypeResDto | null = null;
        const txData = await this.txTypeModel.updateTxType(prarms.typeName, prarms.newTypeName);
        this.cacheTxTypes();
        if (txData) {
            result = new TxTypeResDto(txData);
        }
        return result;
    }

    //  delete txs/types
    async deleteTxType(prarms: DeleteTxTypesReqDto): Promise<TxTypeResDto> {
        let result: TxTypeResDto | null = null;
        const txData = await this.txTypeModel.deleteTxType(prarms.typeName);
        this.cacheTxTypes();
        if (txData) {
            result = new TxTypeResDto(txData);
        }
        return result;
    }

    // txs/services
    async findServiceList(query: ServiceListReqDto): Promise<ListStruct<ServiceResDto[]>> {
        const { pageNum, pageSize, useCount, nameOrDescription } = query;
        let count = null, res: ServiceResDto[];
        // 查询出所有服务
        if(pageNum && pageSize){
          const serviceTxList: ITxStruct[] = await (this.txModel as any).findServiceAllList(pageNum, pageSize, nameOrDescription);
          const serviceNameList: IServiceName[] = serviceTxList.map((item: any) => {
              const ex: any = item.msgs[0].msg.ex || {};
              return {
                  serviceName: getServiceNameFromMsgs(item.msgs),
                  description: item.msgs[0].msg.description,
                  bind: ex.bind || 0,
              };
          });

          let serviceNameBindTxsMap = new Map<string, IBindTx[]>();
          const serviceNames = serviceNameList.map(s => s.serviceName);
          if (serviceNames.length > 0) {
              // 通过服务名，查询所有服务下的所有提供者以及绑定的时间
              const bindServiceTxList: ITxStruct[] = await (this.txModel as any).findBindServiceInServiceName(serviceNames);
              const bindTxList: IBindTx[] = bindServiceTxList.map((item: any) => {
                  return {
                      serviceName: item.msgs[0].msg.ex.service_name,
                      provider: item.msgs[0].msg.provider,
                      bindTime: item.time,
                  };
              });
              // 查出每个provider在当前绑定的serviceName下的绑定次数
              // 并按serviceName分组，key：serviceName，value: 该serviceName的绑定列表
              for (const bindTx of bindTxList) {
                  bindTx.respondTimes = 0;
                  if (!cfg.serverCfg.disableServiceRespondTime) {
                      bindTx.respondTimes = await (this.txModel as any).findProviderRespondTimesForService(bindTx.serviceName, bindTx.provider);
                  }
                  const bindTxs = serviceNameBindTxsMap.get(bindTx.serviceName);
                  if (bindTxs) {
                      bindTxs.push(bindTx)
                      serviceNameBindTxsMap.set(bindTx.serviceName, bindTxs)
                  }else {
                      const temp:IBindTx[] = [];
                      temp.push(bindTx)
                      serviceNameBindTxsMap.set(bindTx.serviceName, temp)
                  }
              }
          }

          for (const service of serviceNameList) {
              if (service.bind && service.bind > 0) {
                  service.bindList = serviceNameBindTxsMap.get(service.serviceName) || [];
              } else {
                  service.bindList = [];
              }
          }

          res = serviceNameList.map((service: IServiceName) => {
              return new ServiceResDto(service.serviceName, service.description, service.bindList);
          });
        }

        if (useCount) {
            count = await (this.txModel as any).findAllServiceCount(nameOrDescription);
        }
        return new ListStruct(res, pageNum, pageSize, count);
    }

    // e/services
    async externalFindServiceList(query: DeepPagingReqDto): Promise<ListStruct<ExternalServiceResDto[]>> {
        const { pageNum, pageSize, useCount } = query;
        let count = null, res = [];
        // 查询出所有服务
        if(pageNum && pageSize){
          const serviceTxList: ITxStruct[] = await (this.txModel as any).findServiceAllList(pageNum, pageSize);
          const serviceNameList: ExternalIServiceName[] = serviceTxList.map((item: any) => {
              const ex: any = item.msgs[0].msg.ex || {};
              return {
                  serviceName: getServiceNameFromMsgs(item.msgs),
                  description: item.msgs[0].msg.description,
                  bind: ex.bind || 0,
              };
          });
          for (const name of serviceNameList) {
              if (name.bind && name.bind > 0) {
                  // 通过服务名，查询出该服务下的所有提供者
                  const bindServiceTxList: ITxStruct[] = await (this.txModel as any).findBindServiceTxList(name.serviceName);
                  const bindTxList: ExternalIBindTx[] = bindServiceTxList.map((item: any) => {
                      return {
                          provider: item.msgs[0].msg.provider,
                      };
                  });
                  //查出每个provider在当前绑定的serviceName下的绑定次数
                  for (const bindTx of bindTxList) {
                      bindTx.respondTimes = await (this.txModel as any).findProviderRespondTimesForService(name.serviceName, bindTx.provider);
                  }
                  name.bindList = bindTxList;
              } else {
                  name.bindList = [];
              }
          }
          res = serviceNameList.map((service: IServiceName) => {
              return new ExternalServiceResDto(service.serviceName,service.description,service.bindList);
          });
        }

        if (useCount) {
          count = await (this.txModel as any).findAllServiceCount();
        }
        return new ListStruct(res, pageNum, pageSize, count);
    }

    // e/services/respond-service
    async externalQueryRespondService(query: ExternalQueryRespondServiceReqDto): Promise<ExternalQueryRespondServiceResDto> {
        const { serviceName, providerAddr } = query;
        const res =  await (this.txModel as any).findProviderRespondTimesForService(serviceName, providerAddr);
        return new ExternalQueryRespondServiceResDto(res)
    }

    // /txs/services/providers
    async queryServiceProviders(query: ServiceProvidersReqDto): Promise<ListStruct<ServiceProvidersResDto[]>> {
        const { serviceName, pageNum, pageSize, useCount } = query;
        let res: ServiceProvidersResDto[], count = null;
        if(pageNum && pageSize){
          const bindServiceTxList: ITxStruct[] = await (this.txModel as any).findBindServiceTxList(serviceName, pageNum, pageSize);
          const bindTxList: IBindTx[] = bindServiceTxList.map((item: any) => {
              return {
                  provider: item.msgs[0].msg.provider,
                  bindTime: item.time,
              };
          });
          // console.log(query, bindServiceTxList);
          //查出每个provider在当前绑定的serviceName下所有的绑定次数
          for (const bindTx of bindTxList) {
              bindTx.respondTimes = await (this.txModel as any).findProviderRespondTimesForService(serviceName, bindTx.provider);
          }
          res = bindTxList.map((service: ServiceProvidersResDto) => {
              return new ServiceProvidersResDto(service.provider, service.respondTimes, service.bindTime);
          });
        }
        if (useCount) {
          count = await (this.txModel as any).findServiceProviderCount(serviceName);
        }

        return new ListStruct(res, pageNum, pageSize, count);
    }

    // /txs/services/tx
    async queryServiceTx(query: ServiceTxReqDto): Promise<ListStruct<ServiceTxResDto[]>> {
        const { serviceName, type, status, txId, limit, useCount } = query;
        let res: ServiceTxResDto[], count = null;
        if(limit){
          const txList: ITxStruct[] = await (this.txModel as any).findServiceTx(serviceName, type, status, txId, limit);
          res = txList.map((service: ITxStruct) => {
              return new ServiceTxResDto(service.tx_hash, service.type, service.height, service.time, service.status, service.msgs,
                  service.events, service.signers, service.fee, service.tx_id);
          });
        }
        if (useCount) {
          count = await (this.txModel as any).findServiceTxCount(serviceName, type, status);
        }
        return new ListStruct(res, Number(query.pageNum), Number(query.pageSize), count);
    }

    async queryServiceBindInfo(query: ServiceBindInfoReqDto): Promise<ServiceBindInfoResDto | null> {
        const { serviceName, provider } = query;

        const bindTx: ITxStruct = await (this.txModel as any).findBindTx(serviceName, provider);
        const defineTx: ITxStruct = await (this.txModel as any).findServiceOwner(serviceName);
        if (bindTx && defineTx) {
            const hash = bindTx.tx_hash;
            const time = bindTx.time;
            const owner = (defineTx as any).msgs[0].msg.author;
            return new ServiceBindInfoResDto(hash, owner, time);
        } else {
            return null;
        }
    }

    // /txs/services/respond
    async queryServiceRespondTx(query: ServiceRespondReqDto): Promise<ListStruct<ServiceRespondResDto[]>> {
        const { serviceName, provider, txId, limit, useCount } = query;
        let count = null, res: ServiceRespondResDto[]
        if(limit){
          const respondTxList: ITxStruct[] = await (this.txModel as any).queryServiceRespondTx(serviceName, provider, txId, limit);
          res = respondTxList.map((service: ITxStruct) => {
              const ex: any = (service.msgs as any)[0].msg.ex || {};
              return new ServiceRespondResDto(
                  service.tx_hash,
                  service.type,
                  service.height,
                  service.time,
                  ex.consumer || '',
                  ex.call_hash || '',
                  ex.request_context_id || '',
                  ex.service_name || '',
                  service.status,
                  service.tx_id,
              );
          });
        }
        if (useCount) {
            count = await (this.txModel as any).findRespondServiceCount(serviceName, provider);
        }
        return new ListStruct(res, Number(query.pageNum), Number(query.pageSize), count);

    }

    //  txs/{hash}
    async queryTxWithHash(query: TxWithHashReqDto): Promise<TxResDto> {
        let result: TxResDto | null = null;
        let txData: any;
        if (query.hash && query.hash.startsWith("0x")) {
            txData = await this.txModel.queryTxWithEvmHash(query.hash);
        } else {
            txData = await this.txModel.queryTxWithHash(query.hash);
        }

        if (txData) {
          const {denomIdNftIdNftMap, nftDenomIdNameMap, mtDenomIdNameMap} = await this.getMtNftNameInfoMap(txData);

          for (let i = txData.msgs.length - 1; i >= 0; i--) {
            switch (txData.msgs[i].type) {
              case TxType.mint_nft:
              case TxType.transfer_nft:
              case TxType.edit_nft:
                const nameInfo = denomIdNftIdNftMap.get(txData.msgs[i].msg.denom + '-' + txData.msgs[i].msg.id)
                txData.msgs[i].msg.denom_name = nftDenomIdNameMap.get(txData.msgs[i].msg.denom) || '';
                txData.msgs[i].msg.nft_name = nameInfo?.nft_name || '';
                break;
              case TxType.burn_nft:
                txData.msgs[i].msg.denom_name = nftDenomIdNameMap.get(txData.msgs[i].msg.denom) || '';
                break;
              // mt
              case TxType.mt_transfer_denom:
                txData.msgs[i].msg.denom_name = mtDenomIdNameMap.get(txData.msgs[i].msg.id) || '';
                break;
              case TxType.mint_mt:
              case TxType.edit_mt:
              case TxType.transfer_mt:
              case TxType.burn_mt: {
                txData.msgs[i].msg.denom_name = mtDenomIdNameMap.get(txData.msgs[i].msg.denom_id) || '';
                break;
              }

              case TxType.create_validator:
                txData.msgs[i].msg.pubkey = getConsensusPubkey(JSON.parse(txData.msgs[0].msg.pubkey).key);
            }
          }

            let txEvms:any;
            if (query.hash && query.hash.startsWith("0x")) {
                txEvms = await this.txEvmModel.findEvmTxsByEvmHash(query.hash)
                if (!txEvms.length) {
                    txEvms = await this.txEvmModel.findNewEvmTxsByEvmHash(query.hash)
                }
            }else{
                txEvms = await this.txEvmModel.findEvmTxsByHashes([query.hash])
            }
            txData = this.handleEvmTx(txEvms,txData)
            const tx = await this.addMonikerToTxs([txData]);
            result = new TxResDto(tx[0] || {});
        }
        return result;
    }

  // Need return denom_name or nft_name in some type whose name_info don't exist in msg
  // i. traversal txs
  // ii. when nft/mt type, push id in list
  // iii. use id list find name_info
  // iv. return map
  private async getMtNftNameInfoMap(txData: any) {
    const nftIds: string[] = [];
    const nftDenomIds: string[] = [];
    const mtDenomIds: string[] = [];
    for (let msg of txData.msgs) {
      switch (msg.type) {
        case TxType.mint_nft:
        case TxType.transfer_nft:
        case TxType.edit_nft:
        case TxType.burn_nft:
            nftIds.push(msg.msg.id)
            nftDenomIds.push(msg.msg.denom);
          break;
        case TxType.mt_transfer_denom:
          mtDenomIds.push(msg.msg.id);
          break;
        case TxType.mint_mt:
        case TxType.edit_mt:
        case TxType.transfer_mt:
        case TxType.burn_mt: {
          mtDenomIds.push(msg.msg.denom_id);
          break;
        }
      }
    }

    const denomIdNftIdNftMap = new Map<string, any>();
    const nftDenomIdNameMap = new Map<string, string>();
    const mtDenomIdNameMap = new Map<string, string>();
    if (nftIds.length) {
      const nfts = await this.nftModel.findListInNftIds(nftIds);
      nfts.forEach(n => denomIdNftIdNftMap.set(n.denom_id + "-" + n.nft_id, n));
    }

    if (nftDenomIds.length) {
        const denoms = await this.denomModel.findAllInDenomID(nftDenomIds);
        denoms.forEach(d => nftDenomIdNameMap.set(d.denom_id, d.name));
    }

    if (mtDenomIds.length) {
      const denoms = await this.mtDenomModel.findListInDenomIds(mtDenomIds);
      denoms.forEach(d => mtDenomIdNameMap.set(d.denom_id, d.denom_name));
    }
    return {denomIdNftIdNftMap, nftDenomIdNameMap, mtDenomIdNameMap};
  }

  handleEvmTx(txEvms,txData) {
      //原来数据
      let mapEvmContract = new Map()
      //修改后的数据
      let EvmContract = new Map()
      if (txEvms?.length) {
          for (const evmTx of txEvms) {
              if (evmTx?.evm_datas?.length) {
                  for (const data of evmTx.evm_datas) {
                      mapEvmContract.set(data?.evm_tx_hash, data)
                  }
                  EvmContract.set(evmTx?.evm_tx_hash, evmTx)
              }
          }
      }

      txData?.msgs?.forEach((msg,index) => {
          switch (msg.type) {
              case TxType.ethereum_tx:
                  msg.msg.ex = {};
                  if (mapEvmContract.has(msg?.msg?.hash) || EvmContract.has(msg?.msg?.hash)) {
                      const evmCt = mapEvmContract.get(msg?.msg?.hash);
                      const evm = EvmContract.get(msg?.msg?.hash);
                      const msgData = JSON.parse(msg?.msg?.data)
                     // msg.msg.ex['data'] = msgData?.data || "";
                      if (evm?.evm_datas?.length) {
                          msg.msg.ex['data'] = evm?.evm_datas[0].raw_input
                      }else {
                          msg.msg.ex['data'] = msgData?.data || "";
                      }
                      msg.msg.ex['contract_address'] = evmCt?.contract_address ? evmCt?.contract_address : evm.contract_address
                      if (evmCt?.evm_method) {
                          msg.msg.ex['method'] = evmCt?.evm_method
                      } else if (evm?.evm_datas[0].input_data) {
                          if (evm?.evm_datas[0].input_data.name == "") {
                              msg.msg.ex['method'] = evm?.evm_datas[0].input_data.id
                          } else {
                              msg.msg.ex['method'] = evm?.evm_datas[0].input_data.name
                          }
                      } else {
                          msg.msg.ex['method'] = "--"
                      }
                  }
          }
      });

      /*let mapEvmContract = new Map()
      let mapEvmDdc = new Map()
      let ddcIdsOfBatch = [], ddcUrisOfBatch = [], isBatch = false
      if (txEvms?.length) {
        for( const evmTx of txEvms) {
          if (evmTx?.evm_datas?.length){
            for (const data of evmTx.evm_datas) {
              mapEvmContract.set(data?.evm_tx_hash, data)
                if (data?.evm_method?.includes("Batch")) {
                    isBatch = true
                }
            }
          }
          if (evmTx?.ex_ddc_infos?.length){
            for (const data of evmTx.ex_ddc_infos) {
                mapEvmDdc.set(data?.evm_tx_hash, data)
                ddcIdsOfBatch.push(data?.ddc_id)
                ddcUrisOfBatch.push(data?.ddc_uri)
            }
          }
        }

        txData?.msgs?.forEach((msg,index) => {
          switch (msg.type) {
            case TxType.ethereum_tx:
              msg.msg.ex={};
              if (mapEvmContract.has(msg?.msg?.hash)) {
                const evmCt = mapEvmContract.get(msg?.msg?.hash);
                if (evmCt?.data_type != DDCType.dataDdc ){
                  return
                }
                const msgData = JSON.parse(msg?.msg?.data)
                msg.msg.ex['data'] = msgData?.data || "";
                msg.msg.ex['contract_address'] = evmCt?.contract_address;
                msg.msg.ex['ddc_method'] = evmCt?.evm_method;

                  //tx_receipt value handle
                  let txRecipient = {
                      'status': evmCt?.tx_receipt?.status,
                      'log': "",
                  };
                  if (!Number(evmCt?.tx_receipt?.status)) {
                      txRecipient['log'] = evmCt?.tx_receipt?.logs?.length > 0 ? evmCt?.tx_receipt?.logs?.join(",") : defaultEvmTxReceiptErrlog;
                  }
                  msg.msg.ex['tx_receipt'] = txRecipient;
              }
              if (mapEvmDdc.has(msg?.msg?.hash)) {
                const data = mapEvmDdc.get(msg?.msg?.hash)
                if (data?.ddc_type != DDCType.ddc721 && data?.ddc_type != DDCType.ddc1155 ){
                  return
                }
                if (isBatch) {
                      msg.msg.ex['ddc_id'] = ddcIdsOfBatch;
                      msg.msg.ex['ddc_uri'] = ddcUrisOfBatch;
                }else{
                    msg.msg.ex['ddc_id'] = data?.ddc_id;
                    msg.msg.ex['ddc_uri'] = data?.ddc_uri;
                }
                msg.msg.ex['ddc_type'] = data?.ddc_type;
                msg.msg.ex['ddc_name'] = data?.ddc_name;
                msg.msg.ex['ddc_symbol'] = data?.ddc_symbol;
                msg.msg.ex['sender'] = data?.sender;
                msg.msg.ex['recipient'] = data?.recipient;
              }
          }
        });
      }*/
      // const item = JSON.parse(JSON.stringify(txData));
      // if (!txData.contract_addrs?.length) {
      //     item.contract_addrs= contractAddrs
      // }
      return txData
    }
    //tx/identity
    async queryIdentityTx(query: IdentityTxReqDto): Promise<ListStruct<TxResDto[]>> {
      const { txId, limit, useCount } = query;
      let txListData,txData = [],count = null;
      if(limit){
        txListData = await this.txModel.queryTxListByIdentity(query);
        txData = txListData.data
      }
      if(useCount){
        count = await this.txModel.queryTxListByIdentityCount(query);
      }

      return new ListStruct(TxResDto.bundleData(txData), Number(query.pageNum), Number(query.pageSize), count);
    }

    // txs/asset
    async queryTxWithAsset(query: TxListWithAssetReqDto): Promise<ListStruct<TxResDto[]>> {
      const { txId, limit, useCount } = query;
      let txListData, txData = [], count = null;
      if(limit){
        txListData = await this.txModel.queryTxWithAsset(query);
        txData = txListData.data
      }
      if(useCount){
        count = await this.txModel.queryTxWithAssetCount(query);
      }

      return new ListStruct(TxResDto.bundleData(txData), Number(query.pageNum), Number(query.pageSize), count);
    }

    // txs/types/gov
    async queryGovTxTypeList(): Promise<TxTypeResDto[]> {
        const txTypeListData = await this.txTypeModel.queryGovTxTypeList();
        return TxTypeResDto.bundleData(txTypeListData);
    }

    private handleMsg(txList, queryDb: ITxsQuery) {
        let typeArr = []
        if (queryDb.type && queryDb.type.length){
            typeArr = queryDb.type.split(",");
        }
        (txList).forEach(tx => {
            const typeMap = new Map<string, any>();
            const senderSet = new Set();
            const recipientSet = new Set();
            const idSet = new Set();
            const nameSet = new Set();
            const denomSet = new Set();
            (tx.msgs || []).forEach((msg,index) => {
                //nft处理多msgs
                let typeList = typeMap.get(msg.type) || []
                typeList.push(msg)
                typeMap.set(msg.type, typeList)

                if (typeArr.length == 1 && msg.type === typeArr[0]) {
                    senderSet.add(msg.msg.sender)
                    if (msg.msg.recipient && msg.msg.recipient.length){
                        recipientSet.add(msg.msg.recipient)
                    }
                    if (msg.msg.id && msg.msg.id.length) {
                        idSet.add(msg.msg.id)
                    }
                    if (msg.msg.denom && msg.msg.denom.length) {
                        denomSet.add(msg.msg.denom)
                    }
                    if (msg.msg.name && msg.msg.name.length) {
                        nameSet.add(msg.msg.name)
                    }
                }
            });

            if (typeArr.length == 1){
                if (typeArr[0] == TxType.issue_denom || typeArr[0] === TxType.transfer_denom ||
                    typeArr[0] === TxType.mint_nft || typeArr[0] === TxType.edit_nft ||
                    typeArr[0] === TxType.burn_nft || typeArr[0] === TxType.transfer_nft) {
                    let extend = {}, properties = {}
                    if (idSet.size == 1){
                        properties['id'] = idSet.values().next().value
                    }
                    if (denomSet.size == 1){
                        properties['denom'] = denomSet.values().next().value
                    }
                    if (nameSet.size == 1){
                        properties['name'] = nameSet.values().next().value
                    }
                    if (senderSet.size == 1){
                        properties['sender'] = senderSet.values().next().value
                    }
                    if (recipientSet.size == 1){
                        properties['recipient'] = recipientSet.values().next().value
                    }
                    extend['properties'] = properties
                    tx.extend = extend
                    tx.msgs = []
                }
            }

            if (typeArr.length > 1 || typeArr.length == 0){
                tx.msgs = []
            }
            let typeList = [];
            typeMap.forEach((value, key) => {
                let msgType = {}
                msgType['msg_type'] = key
                msgType['num'] = value.length
                typeList.push(msgType)
            })
            tx.statistics_msg_type = typeList;
        });
        return txList
    }
}

