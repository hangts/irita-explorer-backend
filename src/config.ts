const {
    LCD_ADDR,
    DB_USER,
    DB_PASSWD,
    DB_ADDR,
    DB_DATABASE,
    NODE_ENV,
    DENOM_INTERVAL,
    NFT_INTERVAL,
    TX_SERVICE_NAME_EXECUTE_INTERVAL,
    DENOM_EXECUTE_TIME,
    NFT_EXECUTE_TIME,
    TX_SERVICE_NAME_EXECUTE_TIME,
    FAULT_TOLERANCE_EXECUTE_TIME,
    SYNC_TX_SERVICE_NAME_SIZE,
    HEARTBEAT_RATE,
} = process.env;

export const cfg = {
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
            denom:Number(DENOM_INTERVAL || 60),
            nft:Number(NFT_INTERVAL || 60),
            txServiceName:Number(TX_SERVICE_NAME_EXECUTE_INTERVAL || 60),
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
};