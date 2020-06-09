const {
    LCD_ADDR,
    DB_USER,
    DB_PASSWD,
    DB_ADDR,
    DB_DATABASE,
    NODE_ENV
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
    }

};