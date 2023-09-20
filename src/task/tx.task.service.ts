import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    getReqContextIdWithReqId,
    getServiceNameFromMsgs,
    getConsumerFromMsgs,
    getRequestIdFromMsgs,
    getReqContextIdFromMsgs,
    getCtxKey,
    getReqContextIdFromEventsNew,
    getServiceNameFromEventsNew,
    getProviderFromMsgs,
    getServiceNameKey,
    splitServiceNameKey, getServiceTxKey, splitServiceTxKey
} from '../helper/tx.helper';
import { IExFieldQuery, ITxStruct } from '../types/schemaTypes/tx.interface';
import { IExFieldTx } from '../types/tx.interface';
import {TxType, TxStatus, TaskEnum} from '../constant';
import {CronTaskWorkingStatusMetric} from "../monitor/metrics/cron_task_working_status.metric";

@Injectable()
export class TxTaskService {
    constructor(@InjectModel('Tx') private txModel: any,
                @InjectModel('ServiceStatistics') private serviceStatisticsModel: any,
                private readonly cronTaskWorkingStatusMetric: CronTaskWorkingStatusMetric,) {
        this.doTask = this.doTask.bind(this);
        this.cronTaskWorkingStatusMetric.collect(TaskEnum.txServiceName,0)
    }

    async doTask(): Promise<void>{
        const promiseList: Promise<any>[] = [];
        let callServiceTxMap:object = {};//将要请求call_service tx map
        let callContextIds = new Set();
        let providerRespondCountMap = new Map();
        let serviceTxCountMap = new Map();
        let respondServiceTxData = await this.txModel.findAllServiceTx();
        //不需要查询callService tx 的数据组装
        respondServiceTxData.forEach((item:IExFieldTx)=>{
            switch(item.type){
                case TxType.respond_service:{
                    let reqContextId:string = getReqContextIdWithReqId(getRequestIdFromMsgs(item.msgs) || '').toUpperCase();
                    if (reqContextId && reqContextId.length) {
                        let key = getCtxKey(reqContextId, item.type);
                        //不同的respond_service 可以响应同一个call_service
                        if (callServiceTxMap[key]) {
                            callServiceTxMap[key].push(item);
                        }else{
                            callServiceTxMap[key] = [item];
                        }
                        callContextIds.add(reqContextId);
                    }
                    //统计每个服务，provider的响应次数
                    if (item.status == TxStatus.SUCCESS) {
                        const serviceName = getServiceNameFromEventsNew(item.events_new)
                        const provider = getProviderFromMsgs(item.msgs)
                        const key = getServiceNameKey(serviceName, provider)
                        const count = providerRespondCountMap.get(key) || 0
                        providerRespondCountMap.set(key, count + 1)
                    }
                }
                break;
                case TxType.pause_request_context:
                case TxType.start_request_context:
                case TxType.kill_request_context:
                case TxType.update_request_context:{
                    let reqContextId:string = (getReqContextIdFromMsgs(item.msgs) || '').toUpperCase();
                    if (reqContextId && reqContextId.length) {
                        callServiceTxMap[getCtxKey(reqContextId, item.type)] = item;
                        callContextIds.add(reqContextId.toUpperCase());
                    }
                }
                break;
                case TxType.bind_service:
                case TxType.define_service:
                case TxType.call_service:
                case TxType.update_service_binding:
                case TxType.disable_service_binding:
                case TxType.enable_service_binding:
                case TxType.refund_service_deposit:{
                    let ex_service_name = getServiceNameFromMsgs(item.msgs);
                    if (ex_service_name && ex_service_name.length) {
                        item.ex_service_name = ex_service_name;
                    }
                }
                break;
                default:
                break;
            }
        });

        let callServiceTxs = await this.txModel.findCallServiceTxWithReqContextIds(Array.from(callContextIds));
        //需要查询callService tx 的数据组装
        callServiceTxs.forEach((item:ITxStruct)=>{
            let serviceName = getServiceNameFromMsgs(item.msgs);
            const consumer: string = getConsumerFromMsgs(item.msgs);
            let reqContextId = getReqContextIdFromEventsNew(item.events_new);
            let callTypes = [
                getCtxKey(reqContextId, TxType.respond_service),
                getCtxKey(reqContextId, TxType.pause_request_context),
                getCtxKey(reqContextId, TxType.start_request_context),
                getCtxKey(reqContextId, TxType.kill_request_context),
                getCtxKey(reqContextId, TxType.update_request_context)
            ];
            callTypes.forEach((key)=>{
                let resTx:any = callServiceTxMap[key];
                if (key == getCtxKey(reqContextId, TxType.respond_service)) {//respond_service 数据结构为Array
                    if (resTx) {
                        resTx.forEach((respond_service_item:IExFieldTx)=>{
                            respond_service_item.ex_service_name = serviceName;
                            respond_service_item.ex_call_hash = item.tx_hash
                            respond_service_item.ex_consumer = consumer;
                            respond_service_item.ex_request_context_id = reqContextId;
                        })
                    }
                }else{
                    if (resTx) {
                        resTx.ex_service_name = serviceName;
                    }
                }
            });
        });
        //更新到数据库
        for (const item of respondServiceTxData) {
            let exFieldQuery:IExFieldQuery = {hash:item.tx_hash};
            //统计每个服务每种交易的类型的数量
            const serviceTxKey = getServiceTxKey(item.ex_service_name, item.type, item.status)
            const count = serviceTxCountMap.get(serviceTxKey) || 0
            serviceTxCountMap.set(serviceTxKey, count + 1)

            if (item.type == TxType.bind_service && item.status == TxStatus.SUCCESS) {
                const res: ITxStruct = await this.txModel.queryDefineServiceTxHashByServiceName(getServiceNameFromMsgs(item.msgs), TxStatus.SUCCESS);
                if (res && res.tx_hash && res.tx_hash.length) {
                   let subExFieldQuery: IExFieldQuery = {
                        hash: res.tx_hash,
                        bind: 1,
                    };
                    this.txModel.addExFieldForServiceTx(subExFieldQuery);
                }
            }
            exFieldQuery.serviceName = item.ex_service_name;
            exFieldQuery.requestContextId = item.ex_request_context_id;
            exFieldQuery.consumer = item.ex_consumer;
            exFieldQuery.callHash = item.ex_call_hash;
            this.txModel.addExFieldForServiceTx(exFieldQuery);
        }

        providerRespondCountMap.forEach((value, key) => {
            const {serviceName, provider} = splitServiceNameKey(key);
            promiseList.push(this.serviceStatisticsModel.updateServiceProviderCount(serviceName, provider, value));
        })

        serviceTxCountMap.forEach((value, key) => {
            const {serviceName, txType, status} = splitServiceTxKey(key);
            promiseList.push(this.serviceStatisticsModel.updateServiceTxCount(serviceName, txType, Number(status), value));
        })

        await Promise.all(promiseList);

        this.cronTaskWorkingStatusMetric.collect(TaskEnum.txServiceName,1)
    }
}

