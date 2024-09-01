import log4js from 'log4js';
import Constant from '../Constant';

log4js.configure({
    //设置追加器
    appenders:{
        console:{ type:'console' },
        info:{
            type: 'file', 
            filename: 'logs/all-logs.log'
        },
        error:{
            type: 'dateFile',
            filename:'logs/error.log',
            pattern:'yyyy-MM-dd.log',
            alwaysIncludePattern:true// 设置文件名称为 filename + pattern
        }
    },
    //指定哪些追加器可以输出来
    categories:{
        default:{ 
            appenders: [ 'info','console' ], 
            level: 'debug' 
        },
        info:{
            appenders: [ 'info','console' ],
            level: 'info'
        },
        error:{
            appenders: ['error','info','console' ],
            level: 'error'
        }
    }
})


class Logger {

    constructor(module){
        this.logger = log4js.getLogger(module);
        this.logger.level = Constant.IS_DEVELOPMENT ? 'debug' : 'info';
    }

    debug(content, ...args){
        this.logger.debug(content, ...args);
    }

    info(content, ...args){
        this.logger.info(content, ...args);
    }

    warn(content, ...args){
        this.logger.error(content, ...args);
    }

    error(content, ...args){
        this.logger.error(content, ...args);
    }
}


const defaultLogger = new Logger("ddm");

export { defaultLogger, Logger };
export default defaultLogger;