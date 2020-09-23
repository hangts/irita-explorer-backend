import os from 'os'

let bech32 = require('bech32')

export function getIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            let alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
}

export function getTimestamp(): number {
    return Math.floor(new Date().getTime() / 1000);
}

export function formatDateStringToNumber(dateString) {
    return Math.floor(new Date(dateString).getTime() / 1000)
}

export function addressTransform(str:string, prefix?:string) {
    try {
        let bech32str = bech32.decode(str,'utf-8');
        prefix = prefix || '';
        let result = bech32.encode(prefix, bech32str.words)
        return result;
    } catch (e) {
        console.warn('address transform failed', e)
    }
}

export function hexToBech32(hexStr:string, prefix:string = "") {
    try {
        let words = bech32.toWords(Buffer.from(hexStr,'hex'));
        return bech32.encode(prefix, words);
    }catch (e) {
        console.warn('address transform fialed',e)
    }
}

export function pageNation(dataArray: any[], pageSize: number = 0) {
    let index: number = 0;
    let newArray: any = [];
    if (dataArray.length > pageSize) {
        while (index < dataArray.length) {
            newArray.push(dataArray.slice(index, index += pageSize));
        }
    } else {
        newArray = dataArray
    }
    return newArray
}
