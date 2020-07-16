import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from '../logger'
import {
    getReqContextIdWithReqId,
    getReqContextIdFromEvents,
    getServiceNameFromMsgs, getConsumerFromMsgs,
} from '../helper/tx.helper';
import { IExFieldQuery, ITxStruct } from '../types/schemaTypes/tx.interface';
import { TxType } from '../constant';

@Injectable()
export class TxTaskService {
    constructor(@InjectModel('Tx') private txModel: any) {
        this.doTask = this.doTask.bind(this);
    }

    async syncRespondServiceTxServiceName(){
        let respondServiceTxMap:object = {};
        
        let respondServiceTxData = await this.txModel.findRespondServiceTx();
        console.log('----',respondServiceTxData)
        respondServiceTxData.forEach((item:{tx_hash:string, msgs:any[]})=>{
            let reqContextId:string = '';
            if (item.msgs && 
                item.msgs.length && 
                item.msgs[0].msg && 
                item.msgs[0].msg.request_id &&
                item.msgs[0].msg.request_id.length) {
                reqContextId = getReqContextIdWithReqId(item.msgs[0].msg.request_id);
            }
            respondServiceTxMap[reqContextId] = {tx_hash:item.tx_hash, reqContextId:reqContextId};
        });

        let callServiceTxs = await this.txModel.findCallServiceTxWithReqContextIds(Object.keys(respondServiceTxMap));

        callServiceTxs.forEach((item:{msgs:[], events:[], tx_hash:''})=>{
            let serviceName = getServiceNameFromMsgs(item.msgs);
            const consumer: string = getConsumerFromMsgs(item.msgs);
            let reqContextId = getReqContextIdFromEvents(item.events);
            let resTx:{tx_hash:string, reqContextId:string, serviceName:string, callHash: string, consumer: string} = respondServiceTxMap[reqContextId];
            resTx.serviceName = serviceName;
            resTx.callHash = item.tx_hash;
            resTx.consumer = consumer;
        });
        Object.values(respondServiceTxMap).forEach((item:{tx_hash:string, reqContextId:string, serviceName:string, callHash: string, consumer: string})=>{
            if (item.tx_hash && item.serviceName) {
                Logger.log('tx sync serviceName:',item);
                this.txModel.updateServiceNameToResServiceTxWithTxHash( item.tx_hash, item.serviceName, item.reqContextId, item.callHash, item.consumer );
            }
        });
    }

    async doTask(): Promise<void>{
        //查询所有关于service的交易
        let txList: ITxStruct[] = await this.txModel.findAllServiceTx();
        await this.syncRespondServiceTxServiceName();
        for(let tx of txList){
            if(tx.type === TxType.pause_request_context || tx.type === TxType.start_request_context ||
                tx.type === TxType.kill_request_context || tx.type === TxType.update_request_context){
                const serviceName: string = await this.queryServiceName(tx)
                let exFieldQuery: IExFieldQuery = {
                    hash: tx.tx_hash,
                    serviceName,
                };
                //在msg结构中加上ex:{service_name:""}
                await this.txModel.addExFieldForServiceTx(exFieldQuery);
            }else if(tx.type === TxType.bind_service){
                let exFieldQuery: IExFieldQuery = {
                    hash: tx.tx_hash,
                    serviceName:(tx as any).msgs[0].msg.service_name,
                };
                //在msg结构中加上ex:{service_name:""}
                await this.txModel.addExFieldForServiceTx(exFieldQuery);
                const res: ITxStruct = await this.queryDefineServiceTxHashByServiceName((tx as any).msgs[0].msg.service_name);
                let subExFieldQuery: IExFieldQuery = {
                    hash: res.tx_hash,
                    bind: 1,
                };
                await this.txModel.addExFieldForServiceTx(subExFieldQuery);
            }else {
                let serviceName: string = '';
                if(tx.type === TxType.define_service){
                    serviceName = (tx as any).msgs[0].msg.name
                }else {
                    serviceName = (tx as any).msgs[0].msg.service_name
                }
                let exFieldQuery: IExFieldQuery = {
                    hash: tx.tx_hash,
                    serviceName,
                };
                //在msg结构中加上ex:{service_name:""}
                await this.txModel.addExFieldForServiceTx(exFieldQuery);
            }
        }



    }

    async queryServiceName(tx: ITxStruct): Promise<string>{
        return await this.txModel.queryServiceName((tx as any).msgs.msg.request_context_id);

    }

    async queryDefineServiceTxHashByServiceName(serviceName: string): Promise<ITxStruct>{
        return await this.txModel.queryDefineServiceTxHashByServiceName(serviceName);

    }


}

