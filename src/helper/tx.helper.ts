export function getReqContextIdWithReqId(requestId:string):string{
    if (requestId && requestId.length && requestId.length>=80) {
        return requestId.substr(0,80).toUpperCase();
    }else{
        return '';
    }
}

export function getReqContextIdFromEvents(events:[]):string{
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

export function getServiceNameFromMsgs(msgs:[]):string{
    let serviceName:string = '';
    if (msgs && msgs.length) {
        msgs.forEach((msg:{msg:{service_name:string}})=>{
            if (!serviceName.length && msg.msg && msg.msg.service_name) {
                serviceName = msg.msg.service_name || '';
            }
        });
    }
    return serviceName;
}