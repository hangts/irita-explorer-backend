const {
    LCD_ADDR,
    DB_USER,
    DB_PASSWD,
    DB_ADDR,
    DB_DATABASE,
    NODE_ENV,
    DENOM_INTERVAL,
    NFT_INTERVAL,
    FAULT_TOLERANCE_INTERVAL,
    DENOM_EXECUTE_TIME,
    NFT_EXECUTE_TIME,
    FAULT_TOLERANCE_EXECUTE_TIME,
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
            denom:Number(DENOM_INTERVAL),
            nft:Number(NFT_INTERVAL),
            faultTolerance:Number(FAULT_TOLERANCE_INTERVAL),
        },
        executeTime:{
            denom:DENOM_EXECUTE_TIME,
            nft:NFT_EXECUTE_TIME,
            faultTolerance:FAULT_TOLERANCE_EXECUTE_TIME,
        }
    }

};