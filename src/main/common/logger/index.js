import { BrowserWindow}         from 'electron'
import log4js                   from 'log4js';
import util                     from 'util';
import Constant                 from '../Constant';


log4js.configure({
    //设置追加器
    appenders:{
        console:{ type:'console' },
        info:{
            type: 'file', 
            filename: Constant.APPLICATION_LOG_FILE,
            daysToKeep: 3
        },
        error:{
            type: 'dateFile',
            filename: Constant.APPLICATION_LOG_ERROR_File,
            pattern:'yyyy-MM-dd.log',
            alwaysIncludePattern:true,// 设置文件名称为 filename + pattern
            daysToKeep: 3
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
        this.module = module;
        this.logger = log4js.getLogger(module);
        this.logger.level = Constant.IS_DEVELOPMENT ? 'debug' : 'info';
    }

    sendToRenderer(level, content, ...args){
        try {
            const message = `[${level.toUpperCase()}][${this.module}] ${util.format(content, ...args)}\n`;
            BrowserWindow.getAllWindows().forEach(window => {
                if(window && window.webContents){
                    window.webContents.send('applicationLog', message);
                }
            });
        } catch (error) {
            console.error('sync logger render failed', error);
        }
    }

    /** debug 级别日志 */
    debug(content, ...args){
        this.logger.info(content, ...args);
        this.sendToRenderer('debug', content, ...args);
    }

    /** info 级别日志 */
    info(content, ...args){
        this.logger.info(content, ...args);
        this.sendToRenderer('info', content, ...args);
    }

    /** warn 级别日志 */
    warn(content, ...args){
        this.logger.info(content, ...args);
        this.sendToRenderer('warn', content, ...args);
    }

    /** error 级别日志 */
    error(content, ...args){
        this.logger.info(content, ...args);
        this.sendToRenderer('error', content, ...args);
    }
}


const defaultLogger = new Logger("ddm");

export { defaultLogger, Logger };
export default defaultLogger;
