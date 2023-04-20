// import winston  from 'winston';
// import path from 'path';
// import Constant from '@/main/common/Constant.js'
 
// const logger = winston.createLogger({
//   level: 'info',
//   format: winston.format.combine(
//     winston.format.timestamp({
//         format: 'YYYY-MM-DD HH:mm:ss'
//     })
//   ),
//   transports: [
//     new winston.transports.File({
//         filename: Constant.APPLICATION_LOG_COMBINED_FILE,
//         format: winston.format.combine(
//             winston.format.printf(info => `[${info.timestamp}[ [${info.level.toLowerCase()}] [${info.message}]`)
//         )
//     }),
//     // error 日志写入单独的文件
//     new winston.transports.File({
//         filename: Constant.APPLICATION_LOG_ERROR_File,
//         level: 'error',
//         format: winston.format.combine(
//             winston.format.printf(info => `[${info.timestamp}[ [${info.level.toLowerCase()}] [${info.message}]`)
//         )
//     })
//   ],
// });
 
// // 开发环境设置控制台输出
// if (Constant.IS_DEVELOPMENT) {
//   logger.add(new winston.transports.Console({
//     format: winston.format.combine(
//         winston.format.colorize(),
//         winston.format.printf(info => `[${info.timestamp}[ [${info.level.toLowerCase()}] [${info.message}]`)
//     ),
//     stderrLevels: ['info']
//   }));
// }


// /**
//  * Attempts to add file and line number info to the given log arguments.
//  */
//  function formatLogArguments(args) {
//     args = Array.prototype.slice.call(args)

//     const stackInfo = getStackInfo(1)
//     if (stackInfo) {
//         // get file path relative to project root
//         const calleeStr = '[' + stackInfo.relativePath + ':' + stackInfo.line + '] '
//         let content = '';
//         for (let i in args) {
//             if (args[i] instanceof Object) {
//                 content = content + ' ' + JSON.stringify(args[i]);
//             } else {
//                 content = content + ' ' + args[i]
//             }
//         }
//         if (content && content.length > 0) {
//             args[0] = calleeStr + ' ' + content
//         } else {
//             args.unshift(calleeStr)
//         }
//     }

//     return args
// }


// /**
//  * Parses and returns info about the call stack at the given index.
//  */
//  function getStackInfo(stackIndex) {
//     // get call stack, and analyze it
//     // get all file, method, and line numbers
//     const stacklist = (new Error()).stack.split('\n').slice(3)

//     // stack trace format:
//     // http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi
//     // do not remove the regex expresses to outside of this method (due to a BUG in node.js)
//     const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi
//     const stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi

//     const s = stacklist[stackIndex] || stacklist[0]
//     const sp = stackReg.exec(s) || stackReg2.exec(s)

//     if (sp && sp.length === 5) {
//         return {
//             method: sp[1],
//             relativePath: path.relative(process.env.INIT_CWD, sp[2]),
//             line: sp[3],
//             pos: sp[4],
//             file: path.basename(sp[2]),
//             stack: stacklist.join('\n')
//         }
//     }
// }



class Logger {
    debug() {
        //logger.debug.apply(logger, formatLogArguments(arguments))
    }
    
    info() {
        //logger.info.apply(logger, formatLogArguments(arguments))
    }
    
    warn() {
        //logger.warn.apply(logger, formatLogArguments(arguments))
    }
    
    error () {
        //logger.error.apply(logger, formatLogArguments(arguments))
    }
}

export default new Logger();