const {
    LCD_ADDR,
    DB_USER,
    DB_PASSWD,
    DB_ADDR,
    DB_DATABASE,
    NODE_ENV,
    DENOM_EXECUTE_TIME,
    NFT_EXECUTE_TIME,
    TX_SERVICE_NAME_EXECUTE_TIME,
    FAULT_TOLERANCE_EXECUTE_TIME,
    SYNC_TX_SERVICE_NAME_SIZE,
    HEARTBEAT_RATE,
} = process.env;

/*export const cfg = {
    env: NODE_ENV,
    dbCfg: {
        user: DB_USER,
        psd: DB_PASSWD,
        dbAddr: DB_ADDR,
        dbName: DB_DATABASE,
    },
    serverCfg:{
        lcdAddr:LCD_ADDR
    },
    taskCfg:{
        interval:{
            heartbeatRate:Number(HEARTBEAT_RATE || 10),
        },
        executeTime:{
            denom:DENOM_EXECUTE_TIME || '1 * * * * *',
            nft:NFT_EXECUTE_TIME || '21 * * * * *',
            txServiceName:TX_SERVICE_NAME_EXECUTE_TIME || '30 * * * * *',
            faultTolerance:FAULT_TOLERANCE_EXECUTE_TIME || '41 * * * * *',
        },
        syncTxServiceNameSize: Number(SYNC_TX_SERVICE_NAME_SIZE) || 100,
    }
};*/
export const cfg = {
    env: 'development',
    dbCfg: {
        user: 'csrb',
        psd: 'csrbpassword',
        dbAddr: '192.168.150.33:37017',
        dbName: 'sync2',
    },
    serverCfg:{
        lcdAddr:'http://10.2.10.130:2317'
    },
    taskCfg:{
        syncTxServiceNameSize: Number(SYNC_TX_SERVICE_NAME_SIZE) || 100,
        interval:{
            denom:1000,
            nft:1000,
            validators: 1000,
            faultTolerance:1000,
            heartbeatRate:Number(HEARTBEAT_RATE || 10),
        },
        executeTime:{
            denom:"1 * * * * *",
            nft:"1 * * * * *",
            txServiceName:'30 * * * * *',
            validators:"1 * * * * *",
            faultTolerance:"1 * * * * *",
        }
    }
};
