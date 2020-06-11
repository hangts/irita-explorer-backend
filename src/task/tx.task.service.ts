import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Util from '../util/util';

@Injectable()
export class TxTaskService {
    constructor(@InjectModel('Tx') private txModel: any) {
    }

    async syncRespondServiceTxServiceName(){
        let requestContextIds:string[] = [];
        let respondServiceTxMap:object = {};
        
        let respondServiceTxData = await this.txModel.findRespondServiceTx();
        respondServiceTxData.forEach((item:{tx_hash:string, msgs:any[]})=>{
            let reqContextId:string = '';
            if (item.msgs && 
                item.msgs.length && 
                item.msgs[0].msg && 
                item.msgs[0].msg.request_id &&
                item.msgs[0].msg.request_id.length) {
                reqContextId = Util.getReqContextIdWithReqId(item.msgs[0].msg.request_id);
            }
            requestContextIds.push(reqContextId);
            respondServiceTxMap[reqContextId] = {tx_hash:item.tx_hash,reqContextId:reqContextId};
        });

        let callServiceTxs = await this.txModel.findCallServiceTxWithReqContextIds(requestContextIds);

        callServiceTxs.forEach((item:{msgs:[], events:[]})=>{
            let serviceName = Util.getServiceNameFromMsgs(item.msgs);
            let reqContextId= Util.getReqContextIdFromEvents(item.events);
            let resTx:{tx_hash:string,requestContextId:string,serviceName:string} = respondServiceTxMap[reqContextId];
            resTx.serviceName = serviceName;
        });
        Object.values(respondServiceTxMap).forEach((item:{tx_hash:string,requestContextId:string,serviceName:string})=>{
            if (item.tx_hash && item.serviceName) {
                console.log('tx sync serviceName:',item)
                this.txModel.updateServiceNameToResServiceTxWithTxHash(item.tx_hash,item.serviceName);
            }
        });
    }
}

