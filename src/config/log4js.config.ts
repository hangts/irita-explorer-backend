import * as path from 'path';
import { LoggerLevel } from '../constant';
const baseLogPath = path.resolve(__dirname, '../../logs'); // 日志要写入哪个目录
const log4jsConfig = {
    appenders: {
        console: {
            type: 'console', // 会打印到控制台
        },
        access: {
            type: 'dateFile', // 会写入文件，并按照日期分类
            filename: `${baseLogPath}/access/access.log`, // 日志文件名，会命名为：access.20200320.log
            alwaysIncludePattern: true,
            pattern: 'yyyyMMdd',
            daysToKeep: 15,
            numBackups: 15,
            category: 'http',
            keepFileExt: true, // 是否保留文件后缀
        },
        app: {
            type: 'dateFile',
            filename: `${baseLogPath}/app-out/app.log`,
            alwaysIncludePattern: true,
            layout: {
                type: 'pattern',
                pattern: '{"date":"%d","level":"%p","category":"%c","host":"%h","pid":"%z","data":\'%m\'}',
            },
            // 日志文件按日期（天）切割
            pattern: 'yyyyMMdd',
            daysToKeep: 15,
            // maxLogSize: 10485760,
            numBackups: 15,
            keepFileExt: true,
        },
        errorFile: {
            type: 'dateFile',
            filename: `${baseLogPath}/errors/error.log`,
            alwaysIncludePattern: true,
            layout: {
                type: 'pattern',
                pattern: '{"date":"%d","level":"%p","category":"%c","host":"%h","pid":"%z","data":\'%m\'}',
            },
            // 日志文件按日期（天）切割
            pattern: 'yyyyMMdd',
            daysToKeep: 15,
            // maxLogSize: 10485760,
            numBackups: 15,
            keepFileExt: true,
        },
        errors: {
          type: 'logLevelFilter',
          level: LoggerLevel.ERROR,
          appender: 'errorFile',
        },
    },
    categories: {
        default: { appenders: ['console'], level: LoggerLevel.DEBUG},
        console: { appenders: ['console'], level: LoggerLevel.DEBUG},
        common: { appenders: ['console', 'app', 'errors'], level: LoggerLevel.INFO },
        http: { appenders: ['access', 'console'], level: LoggerLevel.INFO },
    }
};
export default log4jsConfig;