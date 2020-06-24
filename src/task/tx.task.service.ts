import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from '../log'
import { getReqContextIdWithReqId, 
         getReqContextIdFromEvents,
         getServiceNameFromMsgs } from '../helper/tx.helper';

@Injectable()
export class TxTaskService {
    constructor(@InjectModel('Tx') private txModel: any) {
    }

    async syncRespondServiceTxServiceName(){
        let respondServiceTxMap:object = {};
        
        let respondServiceTxData = await this.txModel.findRespondServiceTx();
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

        callServiceTxs.forEach((item:{msgs:[], events:[]})=>{
            let serviceName = getServiceNameFromMsgs(item.msgs);
            let reqContextId = getReqContextIdFromEvents(item.events);
            let resTx:{tx_hash:string, reqContextId:string, serviceName:string} = respondServiceTxMap[reqContextId];
            resTx.serviceName = serviceName;
        });
        Object.values(respondServiceTxMap).forEach((item:{tx_hash:string, reqContextId:string, serviceName:string})=>{
            if (item.tx_hash && item.serviceName) {
                Logger.log('tx sync serviceName:',item);
                this.txModel.updateServiceNameToResServiceTxWithTxHash( item.tx_hash, item.serviceName, item.reqContextId );
            }
        });
    }
}

