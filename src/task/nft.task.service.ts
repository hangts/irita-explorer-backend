import { Injectable, } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { INft, INftStruct, ITibcNftTransferMsgStruct, ITibcAcknowledgePacketMsgStruct, ITibcRecvPacketMsgStruct } from '../types/schemaTypes/nft.interface';
import { IDenom, IDenomMsgStruct, IDenomStruct } from '../types/schemaTypes/denom.interface';
import md5 from 'blueimp-md5';
import { getTimestamp } from '../util/util';
import { getAwayNewClassPath, ParseClassTrace, TibcClass, getBackNewClassPath } from '../util/util.class';
import { ITxStruct } from '../types/schemaTypes/tx.interface';
import { INCREASE_HEIGHT, MAX_OPERATE_TX_COUNT, NFT_INFO_DO_NOT_MODIFY, TaskEnum, TxType } from '../constant';
import {Logger} from '../logger'
import { IRandomKey } from '../types';
import { taskLoggerHelper } from '../helper/task.log.helper';
import { getTaskStatus } from '../helper/task.helper';
import {CronTaskWorkingStatusMetric} from "../monitor/metrics/cron_task_working_status.metric";
import {StatisticsType} from "../types/schemaTypes/statistics.interface";
@Injectable()
export class NftTaskService {
    constructor(@InjectModel('Nft') private nftModel: Model<INft>,
                @InjectModel('Tx') private txModel: any,
                @InjectModel('Denom') private denomModel: any,
                @InjectModel('SyncTask') private taskModel: any,
                @InjectModel('Statistics') private statisticsModel: any,
                private readonly cronTaskWorkingStatusMetric: CronTaskWorkingStatusMetric,
    ) {
        this.doTask = this.doTask.bind(this);
        this.cronTaskWorkingStatusMetric.collect(TaskEnum.nft,0);
    }

    async denomList() {
        return  await (this.denomModel as any).findList(0, 0, '', 'true');
     }

    async doTask(taskName?: TaskEnum, randomKey?: IRandomKey): Promise<void> {
        let status: boolean = await getTaskStatus(this.taskModel,taskName)
        if (!status) {
            this.cronTaskWorkingStatusMetric.collect(TaskEnum.nft,1)
            return
        }
        taskLoggerHelper(`${taskName}: start to execute task`, randomKey);

      let [nftCount, mintNftCount, burnNftCount] = await this.initNftAllStatistic();
      const nftList: INftStruct[] = await (this.nftModel as any).queryLastBlockHeight();
        taskLoggerHelper(`${taskName}: execute task (step should be start step + 1)`, randomKey);
        let lastBlockHeight = 0;
        if (nftList && nftList.length > 0) {
            lastBlockHeight = nftList[0].last_block_height || 0;
        }
        //查询最高区块, 当递加的高度超过最大交易height的时候, 需要停止查询
        let maxHeight = 0;
        const txList = await (this.txModel as any).queryMaxNftTxList();
        taskLoggerHelper(`${taskName}: execute task (step should be start step + 2)`, randomKey);
        if (txList && txList.length > 0 && txList[0].height > 0) {
            maxHeight = txList[0].height;
        } else {
            this.cronTaskWorkingStatusMetric.collect(TaskEnum.nft,-1)
            //如果高度未查出, 会出现超出tx高度以后一直递加查询仍然达不到 所需要的交易的数量, 会陷入死循环, 需要直接抛出错误
            throw 'the max height of nft tx has not been queried!';
        }

        let nftTxList: ITxStruct[] = await this.getNftTxList(lastBlockHeight, maxHeight);
        taskLoggerHelper(`${taskName}: execute task (step should be start step + 3)`, randomKey);
        if (nftTxList && nftTxList.length > 0) {
            taskLoggerHelper(`${taskName}: execute task (step should be start step + 4)`, randomKey);
            await this.handleNftTx(nftTxList, nftCount, mintNftCount, burnNftCount);
        }
        this.cronTaskWorkingStatusMetric.collect(TaskEnum.nft,1)
        taskLoggerHelper(`${taskName}: end to execute task (step should be start step + 4 or 5)`, randomKey);
    }

  private async initNftAllStatistic(): Promise<[number, number, number]>{
    const names: string[] = ["nft_all", "mint_nft", "burn_nft"];
    const statistic = await this.statisticsModel.findInStatisticsRecord(names);
    const statisticMap = new Map<string, StatisticsType>();
    statistic.forEach(obj => {
        statisticMap.set(obj.statistics_name, obj);
    })

    let nftCount, mintNftCount = 0, burnNftCount = 0;
    if (!statisticMap.has('nft_all')) {
        const count = await this.nftModel.findCount();
        await this.statisticsModel.insertManyStatisticsRecord({
            statistics_name: 'nft_all',
            count: count,
            data: '',
            statistics_info: '',
            create_at: getTimestamp(),
            update_at: getTimestamp(),
        });
    }else {
        nftCount = statisticMap.get('nft_all').count
    }

    if (!statisticMap.has('mint_nft')) {
        await this.statisticsModel.insertManyStatisticsRecord({
            statistics_name: 'mint_nft',
            count: 0,
            data: '',
            statistics_info: '',
            create_at: getTimestamp(),
            update_at: getTimestamp(),
        });
    }else {
        mintNftCount = statisticMap.get('mint_nft').count
    }

    if (!statisticMap.has('burn_nft')) {
        await this.statisticsModel.insertManyStatisticsRecord({
            statistics_name: 'burn_nft',
            count: 0,
            data: '',
            statistics_info: '',
            create_at: getTimestamp(),
            update_at: getTimestamp(),
        });
    }else {
        burnNftCount = statisticMap.get('burn_nft').count
    }

      return [nftCount, mintNftCount, burnNftCount]
  }

  async getNftTxList(lastBlockHeight: number, maxHeight: number): Promise<ITxStruct[]> {

        let list: any[] = [];
        const querynftTxList = async (lastBlockHeight: number) => {
            const nftTxList: ITxStruct[] = await this.queryNftTxList(lastBlockHeight);
            list = list.concat(nftTxList);
            Logger.log(`ex_sync_nft lastBlockHeight: ${lastBlockHeight}, tx count ${list.length}`);
             /*
                1. 高度未达到, tx.length未达到, 查询
                2. 高度未达到, tx.length已达到, 不查询
                3. 高度已达到, tx.length未达到, 不查询
                4. 高度已达到, tx.length已达到, 不查询
             */
            //表查询条件是   lastBlockHeight < cond <= lastBlockHeight+INCREASE_HEIGHT, 所以下面判断需要先 + INCREASE_HEIGHT;
            lastBlockHeight += INCREASE_HEIGHT;
            if (lastBlockHeight < maxHeight && list.length < MAX_OPERATE_TX_COUNT) {
                await querynftTxList(lastBlockHeight);
            }
        };
        if(lastBlockHeight < maxHeight){
            //只有当nft表中的高度落后的时候才执行
            await querynftTxList(lastBlockHeight);
        }


        return list;
    }

    async queryNftTxList(lastBlockHeight: number): Promise<ITxStruct[]> {
        return await (this.txModel as any).queryNftTxList(lastBlockHeight);
    }

    async handleNftTx(nftTxList: any, nftCount: number, mintNftCount: number, burnNftCount: number): Promise<void> {
        const promiseList: Promise<any>[] = [];
        const nftObj = {};
        let last_block_height = 0;
        nftTxList.forEach((tx) => {
            tx.msgs.forEach((item,index) => {
                const {msg} = (item as any);
                if (msg?.denom && msg?.id) {
                    const idStr = `${msg.denom}-${msg.id}`;
                    if (!nftObj[idStr]) nftObj[idStr] = {};
                    switch ((item as any).type) {
                        case TxType.mint_nft:
                            nftObj[idStr].nft_name = msg.name;
                            nftObj[idStr].owner = msg.recipient;//mint_nft如果传一个recipient参数, 那么这个nft的owner就被转移到此地址下
                            nftObj[idStr].uri = msg.uri;
                            nftObj[idStr].data = msg.data;
                            nftObj[idStr].is_deleted = false;
                            nftObj[idStr].create_time = getTimestamp();
                            nftObj[idStr].denom_id = msg.denom;
                            nftObj[idStr].nft_id = msg.id;
                            nftObj[idStr].last_block_height = tx.height;
                            nftObj[idStr].last_block_time = tx.time;
                            nftObj[idStr].update_time = getTimestamp();
                            nftCount++;
                            mintNftCount++;
                            break;
                        case TxType.edit_nft:
                            if (msg.name !== NFT_INFO_DO_NOT_MODIFY) {
                                nftObj[idStr].nft_name = msg.name;
                            }
                            if (msg.uri !== NFT_INFO_DO_NOT_MODIFY) {
                                nftObj[idStr].uri = msg.uri;
                            }
                            if (msg.data !== NFT_INFO_DO_NOT_MODIFY) {
                                nftObj[idStr].data = msg.data;
                            }
                            nftObj[idStr].denom_id = msg.denom;
                            nftObj[idStr].nft_id = msg.id;
                            nftObj[idStr].last_block_height = tx.height;
                            nftObj[idStr].last_block_time = tx.time;
                            nftObj[idStr].update_time = getTimestamp();
                            break;
                        case TxType.transfer_nft:
                            nftObj[idStr].owner = msg.recipient;
                            //转让的时候, 可以对可编辑的信息重新赋值
                            if (msg.name !== NFT_INFO_DO_NOT_MODIFY) {
                                nftObj[idStr].nft_name = msg.name;
                            }
                            if (msg.uri !== NFT_INFO_DO_NOT_MODIFY) {
                                nftObj[idStr].uri = msg.uri;
                            }
                            if (msg.data !== NFT_INFO_DO_NOT_MODIFY) {
                                nftObj[idStr].data = msg.data;
                            }
                            nftObj[idStr].denom_id = msg.denom;
                            nftObj[idStr].nft_id = msg.id;
                            nftObj[idStr].last_block_height = tx.height;
                            nftObj[idStr].last_block_time = tx.time;
                            nftObj[idStr].update_time = getTimestamp();
                            break;
                        case TxType.burn_nft:
                            nftObj[idStr].denom_id = msg.denom;
                            nftObj[idStr].nft_id = msg.id;
                            nftObj[idStr].is_deleted = true;
                            nftCount--;
                            burnNftCount++;
                            break;
                        }
                    }
                    switch ((item as any).type) {
                        case TxType.tibc_nft_transfer:
                            const transferMsg:ITibcNftTransferMsgStruct = (item as any).msg
                            const idTibcStr = `${transferMsg.class}-${transferMsg.id}`;
                            if (!nftObj[idTibcStr]) nftObj[idTibcStr] = {};
                            nftObj[idTibcStr].denom_id = transferMsg.class;
                            nftObj[idTibcStr].nft_id = transferMsg.id;
                            nftObj[idTibcStr].is_deleted = true;
                            nftCount--;
                            burnNftCount++;
                            break;
                        case TxType.tibc_recv_packet:
                            let ackResult = "";
                            tx?.events_new?.forEach((eventNew) => {
                                if (eventNew.msg_index === index) {
                                    (eventNew.events || []).forEach(event => {
                                        if(event.type === "non_fungible_token_packet") {
                                            (event.attributes || []).forEach(item => {
                                                if(item.key === 'success')  {
                                                    ackResult = item.value;
                                                }
                                            })
                                        }
                                    })
                                }
                            });
                            if (ackResult === "true") {
                                const recvMsgData:ITibcRecvPacketMsgStruct = (item as any).msg
                                let denomId = '';
                                if (recvMsgData?.packet?.data?.away_from_origin) {
                                    const newClassPath = getAwayNewClassPath(
                                        recvMsgData?.packet?.source_chain,
                                        recvMsgData?.packet?.destination_chain,
                                        recvMsgData?.packet?.data?.class)
                                    const {path,base_class} = ParseClassTrace(newClassPath)
                                    denomId = TibcClass(path,base_class)
                                } else {
                                    const newClassPath = getBackNewClassPath(
                                        recvMsgData?.packet?.data?.class)
                                    const {path,base_class} = ParseClassTrace(newClassPath)
                                    denomId = TibcClass(path,base_class)
                                }
                                const idStr = `${denomId}-${recvMsgData?.packet?.data?.id}`;
                                if (!nftObj[idStr]) nftObj[idStr] = {};
                                nftObj[idStr].owner = recvMsgData?.packet?.data?.receiver;
                                nftObj[idStr].uri = recvMsgData?.packet?.data?.uri;
                                nftObj[idStr].denom_id = denomId;
                                nftObj[idStr].nft_id = recvMsgData?.packet?.data?.id;
                                nftObj[idStr].is_deleted = false;
                                nftObj[idStr].create_time = getTimestamp();
                                nftObj[idStr].last_block_height = tx.height;
                                nftObj[idStr].last_block_time = tx.time;
                                nftObj[idStr].update_time = getTimestamp();
                                nftCount++;
                                mintNftCount++;
                            }
                            break;
                        case TxType.tibc_acknowledge_packet:
                            const ackMsgData:ITibcAcknowledgePacketMsgStruct= (item as any).msg

                            //ack != 1
                            if (!ackMsgData?.acknowledgement?.includes("result:\"\\001\"")) {
                                //denom id
                                const {path,base_class} = ParseClassTrace(ackMsgData?.packet?.data?.class)
                                const denomId = TibcClass(path,base_class)

                                const idStr = `${denomId}-${ackMsgData?.packet?.data?.id}`;
                                if (!nftObj[idStr]) nftObj[idStr] = {};
                                //create nft data
                                nftObj[idStr].owner = ackMsgData?.packet?.data?.sender;
                                nftObj[idStr].denom_id = denomId;
                                nftObj[idStr].nft_id = ackMsgData?.packet?.data?.id;
                                nftObj[idStr].is_deleted = false;
                                nftObj[idStr].uri = ackMsgData?.packet?.data?.uri;
                                nftObj[idStr].last_block_height = tx.height;
                                nftObj[idStr].last_block_time = tx.time;
                                nftObj[idStr].update_time = getTimestamp();
                                nftObj[idStr].create_time = getTimestamp();
                                nftCount++;
                                mintNftCount++;
                            }
                            break;
                }

            last_block_height = Math.max(tx.height,last_block_height);
        });
        });

        for (let idStr in nftObj) {
            if (nftObj[idStr].is_deleted) {
                delete nftObj[idStr].is_deleted;
                promiseList.push((this.nftModel as any).deleteNft(nftObj[idStr]));
            } else {
                promiseList.push((this.nftModel as any).updateNft(nftObj[idStr]));
            }
        }
        promiseList.push((this.statisticsModel.updateStatisticsRecord({
            statistics_name: 'nft_all',
            count: nftCount,
            data: '',
            statistics_info: '',
            create_at: getTimestamp(),
            update_at: getTimestamp(),
        })))
        promiseList.push((this.statisticsModel.updateStatisticsRecord({
            statistics_name: 'mint_nft',
            count: mintNftCount,
            data: '',
            statistics_info: '',
            create_at: getTimestamp(),
            update_at: getTimestamp(),
        })))
        promiseList.push((this.statisticsModel.updateStatisticsRecord({
            statistics_name: 'burn_nft',
            count: burnNftCount,
            data: '',
            statistics_info: '',
            create_at: getTimestamp(),
            update_at: getTimestamp(),
        })))
        await Promise.all(promiseList);
        if(last_block_height){
            let lastNft =  await (this.nftModel as any).queryLastNft();
            if(lastNft.last_block_height < last_block_height){
                lastNft.last_block_height = last_block_height;
                await (this.nftModel as any).updateLastBlockHeight(lastNft);
            }
        }
    }
}

