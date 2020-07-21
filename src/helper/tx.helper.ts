export function getReqContextIdWithReqId(requestId:string):string{
    if (requestId && requestId.length && requestId.length>=80) {
        return requestId.substr(0,80).toUpperCase();
    }else{
        return '';
    }
}

export function getReqContextIdFromEvents(events:any[]):string{
    let reqContextId:string = '';
    if (events && events.length) {
        events.forEach((item:{attributes:{key:string, value:string}[]})=>{
            if (item.attributes && item.attributes.length) {
                item.attributes.forEach((attribute:{key:string, value:string})=>{
                    if (attribute.key == 'request_context_id') {
                        reqContextId = attribute.value || '';
                    }
                });
            }
        });
    }
    return reqContextId;
}

export function getReqContextIdFromMsgs(msgs:any[]):string{
    let contextId:string = '';
    if (msgs && msgs.length) {
        msgs.forEach((msg:{msg:{request_context_id:string}})=>{
            if (!contextId.length && msg.msg && msg.msg.request_context_id) {
                contextId = msg.msg.request_context_id || '';
            }
        });
    }
    return contextId;
}

export function getRequestIdFromMsgs(msgs:any[]):string{
    let requestId:string = '';
    if (msgs && msgs.length) {
        msgs.forEach((msg:{msg:{request_id:string}})=>{
            if (!requestId.length && msg.msg && msg.msg.request_id) {
                requestId = msg.msg.request_id || '';
            }
        });
    }
    return requestId;
}

export function getServiceNameFromMsgs(msgs:any[]):string{
    let serviceName:string = '';
    if (msgs && msgs.length) {
        msgs.forEach((msg:{msg:{service_name:string, name:string}})=>{
            if (!serviceName.length && msg.msg && (msg.msg.service_name || msg.msg.name)) {
                serviceName = msg.msg.service_name || (msg.msg.name || '');
            }
        });
    }
    return serviceName;
}

export function getConsumerFromMsgs(msgs:any[]):string{
    let consumer:string = '';
    if (msgs && msgs.length) {
        msgs.forEach((msg:{msg:{consumer:string}})=>{
            if (!consumer.length && msg.msg && msg.msg.consumer) {
                consumer = msg.msg.consumer || '';
            }
        });
    }
    return consumer;
}

export function getCtxKey(ctxId:string,type:string){
        return `${ctxId}-${type}`;
    }