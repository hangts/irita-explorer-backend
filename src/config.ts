const {
    MONGODB_USER,
    MONGODB_PSD,
    MONGODB_HOST,
    MONGODB_PORT,
    MONGODB_DATABASE,
    NODE_ENV
} = process.env;

export const cfg = {
    env: NODE_ENV,
    dbCfg: {
        host: MONGODB_HOST,
        port: MONGODB_PORT,
        user: MONGODB_USER,
        psd: MONGODB_PSD,
        db: MONGODB_DATABASE,
    },
};