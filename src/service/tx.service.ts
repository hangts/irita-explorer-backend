import { DeepPagingReqDto } from './../dto/base.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ListStruct, Result } from '../api/ApiResult';
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
  TxTypeResDto,
  TxWithHashReqDto,
} from '../dto/txs.dto';
import { ExternalIBindTx, ExternalIServiceName, IBindTx, IServiceName } from '../types/tx.interface';
import { ITxStruct } from '../types/schemaTypes/tx.interface';
import { getReqContextIdFromEvents, getServiceNameFromMsgs } from '../helper/tx.helper';
import Cache from '../helper/cache';
import { addressPrefix, proposal as proposalString, TxType, DDCType } from '../constant';
import { addressTransform, splitString } from '../util/util';
import { GovHttp } from '../http/lcd/gov.http';
import { getConsensusPubkey } from '../helper/staking.helper';

@Injectable()
export class TxService {
    constructor(@InjectModel('Tx') private txModel: any,
        @InjectModel('TxType') private txTypeModel: any,
        @InjectModel('Denom') private denomModel: any,
        @InjectModel('Nft') private nftModel: any,
        @InjectModel('TxEvm') private txEvmModel: any,
        @InjectModel('Identity') private identityModel: any,
        @InjectModel('StakingValidator') private stakingValidatorModel: any,
        @InjectModel('Proposal') private proposalModel: any,
        @InjectModel('Statistics') private statisticsModel: any,
        private readonly govHttp: GovHttp
    ) {
        this.cacheTxTypes();
    }

    async addMonikerToTxs(txList) {
        const validators = await this.stakingValidatorModel.queryAllValidators();
        const validatorMap = {};
        validators.forEach((item) => {
            validatorMap[item.operator_address] = item;
        });

        const txData = (txList || []).map((tx) => {
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
    async addContractAddrsToTxs(txList) {
          let txHashes = []
          for (const tx of txList) {
            txHashes.push(tx.tx_hash)
          }
          const txEvms = await this.txEvmModel.findEvmTxsByHashes(txHashes)
          let mapEvmContract = new Map()
          if (!txEvms?.length) {
            return txList
          }
          for( const evmTx of txEvms) {
            if (evmTx?.evm_datas?.length){
              for (const data of evmTx.evm_datas) {
                mapEvmContract.set(data?.evm_tx_hash, data?.contract_address)
              }
            }
          }

      return (txList || []).map((tx) => {
            const item = JSON.parse(JSON.stringify(tx));
            let contractAddrs = [];
            if (tx.msgs?.length) {
              tx.msgs?.forEach((msg, index) => {
                if (msg.type === TxType.ethereum_tx) {
                  if (mapEvmContract.has(msg?.msg?.hash)) {
                    contractAddrs.push(mapEvmContract.get(msg?.msg?.hash))
                  }
                }
              })
            }
            item.contract_addrs = contractAddrs;
            return item
          })
      }
    async addContractAddrsToEvmTxs(txEvms) {
      if (!txEvms?.length) {
        return txEvms
      }
      for( const evmTx of txEvms) {
        let contractAddrs = [];
        if (evmTx?.evm_datas?.length){
          for (const data of evmTx.evm_datas) {
            contractAddrs.push(data?.contract_address)
          }
        }
        evmTx.contract_addrs = contractAddrs
      }
      return txEvms
    }
    async cacheTxTypes() {
        const txTypes = await this.txTypeModel.queryTxTypeList();
        Cache.supportTypes = txTypes.map((item) => item.type_name);
    }

    // txs
    async queryTxList(query: TxListReqDto): Promise<ListStruct<TxResDto[]>> {
        // if (!Cache.supportTypes || !Cache.supportTypes.length) {
        const { pageNum, pageSize, useCount } = query;
        let txListData, txData = [], count = null;

        if(pageNum && pageSize || useCount){
          await this.cacheTxTypes();

          if(pageNum && pageSize){
            txListData = await this.txModel.queryTxList(query);
            if (txListData.data && txListData.data.length > 0) {
                txListData.data = this.handerEvents(txListData.data)
                // add evm info about contract_address
                txListData.data = await this.addContractAddrsToTxs(txListData.data)
                txData = await this.addMonikerToTxs(txListData.data);
            }
          }
          if(useCount){
            if (!query?.pageNum && !query?.pageSize && !query?.beginTime && !query?.endTime && !query?.address && !query?.status && !query?.type) {
              //default count with no filter conditions

              const txCnt = await this.statisticsModel.findStatisticsRecord("tx_all")
              count = txCnt?.count
            }else{

              count = await this.txModel.queryTxListCount(query);
            }
          }
        }
        // }

        return new ListStruct(TxResDto.bundleData(txData), Number(query.pageNum), Number(query.pageSize), count);
    }

    // txs/staking
    async queryStakingTxList(query: TxListReqDto): Promise<ListStruct<TxResDto[]>> {
        // if (!Cache.supportTypes || !Cache.supportTypes.length) {
        const { pageNum, pageSize, useCount } = query;
        let txListData , txData = [], count = null;

        if(pageNum && pageSize || useCount){
          await this.cacheTxTypes();

          if(pageNum && pageSize){
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
        // }

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
        const { pageNum, pageSize, useCount } = query;
        let txListData, txData = [],count = null;

        if(pageNum && pageSize || useCount){
          await this.cacheTxTypes();

          if(pageNum && pageSize){
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
        const { pageNum, pageSize, useCount } = query;
        let txListData, txData = [], txList = [], count = null;

        if(pageNum && pageSize){
          await this.cacheTxTypes();

          if(pageNum && pageSize){
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
      const { pageNum, pageSize, useCount } = query;
      let txListData, txData = [],count = null;

      if(pageNum && pageSize || useCount){
        await this.cacheTxTypes();

        if(pageNum && pageSize){
          txListData = await this.txModel.queryTxWithHeight(query);
          // add evm info about contract_address
          txListData.data = await this.addContractAddrsToTxs(txListData.data)
          txData = await this.addMonikerToTxs(txListData.data);
        }
        if(useCount){
          count = await this.txModel.queryTxWithHeighCount(query);
        }
      }
      return new ListStruct(TxResDto.bundleData(txData), Number(query.pageNum), Number(query.pageSize), count);
    }

    //  txs/addresses
    async queryTxWithAddress(query: TxListWithAddressReqDto): Promise<ListStruct<TxResDto[]>> {
      const { pageNum, pageSize, useCount } = query;
      let txListData, txData = [],count = null;
      if(pageNum && pageSize || useCount){
        await this.cacheTxTypes();

        if(pageNum && pageSize){
          txListData = await this.txModel.queryTxWithAddress(query);
          if (txListData.data && txListData.data.length > 0) {
              txListData.data = this.handerEvents(txListData.data);
              // add evm info about contract_address
              txListData.data = await this.addContractAddrsToTxs(txListData.data)
              txData = await this.addMonikerToTxs(txListData.data);
          }
        }
        if(useCount){
          count = await this.txModel.queryTxWithAddressCount(query);
        }
      }

      return new ListStruct(TxResDto.bundleData(txData), Number(query.pageNum), Number(query.pageSize), count);
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
      const { pageNum, pageSize, useCount } = query;
      let txListData, txData = [],count = null;
      if(pageNum && pageSize){
        txListData = await this.txModel.queryTxWithNft(query);
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
      let txListData, txData = [],count = null;
      if(pageNum && pageSize){
        txListData = await this.txEvmModel.queryTxWithDdc(query);
        txData = await this.addContractAddrsToEvmTxs(txListData.data);
      }
      if(useCount){
        count = await this.txEvmModel.queryTxWithDdcCount(query);
      }

      return new ListStruct(TxResDto.bundleData(txData), Number(query.pageNum), Number(query.pageSize), count);
    }

    //废弃
    async queryTxWithServiceName(query: TxListWithServicesNameReqDto): Promise<ListStruct<TxResDto[]>> {
        await this.cacheTxTypes();
        const txListData = await this.txModel.queryTxWithServiceName(query);
        const txData = await this.addMonikerToTxs(txListData.data);
        return new ListStruct(TxResDto.bundleData(txData), Number(query.pageNum), Number(query.pageSize), txListData.count);
    }

    //  txs/services/call-service
    async queryTxWithCallService(query: TxListWithCallServiceReqDto): Promise<ListStruct<callServiceResDto[]>> {
      const { pageNum, pageSize, useCount } = query;
      let txListData, txData = [], count = null;

      if(pageNum && pageSize){
        txListData = await this.txModel.queryCallServiceWithConsumerAddr(query.consumerAddr, pageNum, pageSize);
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

      return new ListStruct(callServiceResDto.bundleData(txData), Number(pageNum), Number(pageSize), count);
    }

    //  txs/services/respond-service
    async queryTxWithRespondService(query: TxListWithRespondServiceReqDto): Promise<ListStruct<TxResDto[]>> {
      const { pageNum, pageSize, useCount } = query;
      let txListData, txData = [], count = null;

      if(pageNum && pageSize){
        txListData = await this.txModel.queryBindServiceWithProviderAddr(query.providerAddr, query.pageNum, query.pageSize, query.useCount);
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

      return new ListStruct(RespondServiceResDto.bundleData(txData), Number(pageNum), Number(pageSize), count);
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
          for (const name of serviceNameList) {
              if (name.bind && name.bind > 0) {
                  // 通过服务名，查询出该服务下的所有提供者以及绑定的时间
                  const bindServiceTxList: ITxStruct[] = await (this.txModel as any).findBindServiceTxList(name.serviceName);
                  const bindTxList: IBindTx[] = bindServiceTxList.map((item: any) => {
                      return {
                          provider: item.msgs[0].msg.provider,
                          bindTime: item.time,
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
        const { serviceName, type, status, pageNum, pageSize, useCount } = query;
        let res: ServiceTxResDto[], count = null;
        if(pageNum && pageSize){
          const txList: ITxStruct[] = await (this.txModel as any).findServiceTx(serviceName, type, status, pageNum, pageSize);
          res = txList.map((service: ITxStruct) => {
              return new ServiceTxResDto(service.tx_hash, service.type, service.height, service.time, service.status, service.msgs, service.events,service.fee);
          });
        }
        if (useCount) {
          count = await (this.txModel as any).findServiceTxCount(serviceName, type, status);
        }
        return new ListStruct(res, pageNum, pageSize, count);
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
        const { serviceName, provider, pageNum, pageSize, useCount } = query;
        let count = null, res: ServiceRespondResDto[]
        if(pageNum && pageSize){
          const respondTxList: ITxStruct[] = await (this.txModel as any).queryServiceRespondTx(serviceName, provider, pageNum, pageSize);
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
              );
          });
        }
        if (useCount) {
            count = await (this.txModel as any).findRespondServiceCount(serviceName, provider);
        }
        return new ListStruct(res, pageNum, pageSize, count);

    }

    //  txs/{hash}
    async queryTxWithHash(query: TxWithHashReqDto): Promise<TxResDto> {
        let result: TxResDto | null = null;
        let txData: any = await this.txModel.queryTxWithHash(query.hash);
        if (txData) {
            if (txData.msgs[0] && txData.msgs[0].msg && txData.msgs[0].msg.denom && txData.msgs[0].msg.denom.length) {
                const nftNameInfo: { denom_name: string, nft_name: string } = {
                    denom_name: '',
                    nft_name: '',
                };
                if (txData.msgs[0].msg.id && txData.msgs[0].msg.id.length) {
                    const nft = await this.nftModel.findOneByDenomAndNftId(txData.msgs[0].msg.denom, txData.msgs[0].msg.id);
                    nftNameInfo.denom_name = (nft || {}).denom_name || '';
                    nftNameInfo.nft_name = (nft || {}).nft_name || '';
                } else {
                    const denom = await this.denomModel.findOneByDenomId(txData.msgs[0].msg.denom);
                    nftNameInfo.denom_name = (denom || {}).name || '';
                }
                txData.msgs[0].msg.denom_name = nftNameInfo.denom_name;
                txData.msgs[0].msg.nft_name = nftNameInfo.nft_name;
            }
            if (txData.msgs[0] && txData.msgs[0].type && txData.msgs[0].type === TxType.create_validator && txData.msgs[0].msg && txData.msgs[0].msg.pubkey) {
                txData.msgs[0].msg.pubkey = getConsensusPubkey(JSON.parse(txData.msgs[0].msg.pubkey).key);
            }
            const txEvms = await this.txEvmModel.findEvmTxsByHashes([query.hash])
            txData = this.handleEvmTx(txEvms,txData)

            const tx = await this.addMonikerToTxs([txData]);
            result = new TxResDto(tx[0] || {});
        }
        return result;
    }
    handleEvmTx(txEvms,txData) {
      let mapEvmContract = new Map(),batchEvmMap = new Map()
      let mapEvmDdc = new Map()
      let contractAddrs = [];
      if (txEvms?.length) {
        for( const evmTx of txEvms) {
          if (evmTx?.evm_datas?.length){
            for (const data of evmTx.evm_datas) {
              mapEvmContract.set(data?.evm_tx_hash, data)
                if (data?.evm_method?.includes("Batch")) {
                    batchEvmMap.set(data?.evm_tx_hash,[])
                }
            }
          }
          if (evmTx?.ex_ddc_infos?.length){
            for (const data of evmTx.ex_ddc_infos) {
              mapEvmDdc.set(data?.evm_tx_hash, data)
                if (batchEvmMap.has(data?.evm_tx_hash)) {
                    let ddcIdsOfBatch = batchEvmMap.get(data?.evm_tx_hash)
                    ddcIdsOfBatch.push(data?.ddc_id)
                    batchEvmMap.set(data?.evm_tx_hash,ddcIdsOfBatch)
                }
            }
          }
        }

        txData?.msgs?.forEach((msg,index) => {
          switch (msg.type) {
            case TxType.ethereum_tx:
              msg.msg.ex={}
              if (mapEvmContract.has(msg?.msg?.hash)) {
                const evmCt = mapEvmContract.get(msg?.msg?.hash);
                if (evmCt?.data_type != DDCType.dataDdc ){
                  return
                }
                contractAddrs.push(evmCt?.contract_address)
                msg.msg.ex['contract_address'] = evmCt?.contract_address
                msg.msg.ex['ddc_method'] = evmCt?.evm_method
              }
              if (mapEvmDdc.has(msg?.msg?.hash)) {
                const data = mapEvmDdc.get(msg?.msg?.hash)
                if (data?.ddc_type != DDCType.ddc721 && data?.ddc_type != DDCType.ddc1155 ){
                  return
                }
                if (batchEvmMap.has(msg?.msg?.hash)) {
                    msg.msg.ex['ddc_id'] = batchEvmMap.get(msg?.msg?.hash)
                }else{
                    msg.msg.ex['ddc_id'] = data?.ddc_id
                }
                msg.msg.ex['ddc_type'] = data?.ddc_type;
                msg.msg.ex['ddc_name'] = data?.ddc_name;
                msg.msg.ex['ddc_uri'] = data?.ddc_uri;
                msg.msg.ex['ddc_symbol'] = data?.ddc_symbol;
                msg.msg.ex['sender'] = data?.sender;
                msg.msg.ex['recipient'] = data?.recipient;
              }
          }
        });
      }
      const item = JSON.parse(JSON.stringify(txData));
      item.contract_addrs= contractAddrs
      return item
    }
    //tx/identity
    async queryIdentityTx(query: IdentityTxReqDto): Promise<ListStruct<TxResDto[]>> {
      const { pageNum, pageSize, useCount } = query;
      let txListData,txData = [],count = null;
      if(pageNum && pageSize){
        txListData = await this.txModel.queryTxListByIdentity(query);
        txData = txListData.data
      }
      if(useCount){
        count = await this.txModel.queryTxListByIdentityCount(query);
      }

      return new ListStruct(TxResDto.bundleData(txData), Number(pageNum), Number(pageSize), count);
    }

    // txs/asset
    async queryTxWithAsset(query: TxListWithAssetReqDto): Promise<ListStruct<TxResDto[]>> {
      const { pageNum, pageSize, useCount } = query;
      let txListData, txData = [], count = null;
      if(pageNum && pageSize){
        txListData = await this.txModel.queryTxWithAsset(query);
        txData = txListData.data
      }
      if(useCount){
        count = await this.txModel.queryTxWithAssetCount(query);
      }

      return new ListStruct(TxResDto.bundleData(txData), Number(pageNum), Number(pageSize), count);
    }

    // txs/types/gov
    async queryGovTxTypeList(): Promise<TxTypeResDto[]> {
        const txTypeListData = await this.txTypeModel.queryGovTxTypeList();
        return TxTypeResDto.bundleData(txTypeListData);
    }
}

