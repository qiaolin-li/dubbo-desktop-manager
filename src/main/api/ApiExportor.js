import { Logger }           from '@/main/common/logger';
import appConfig            from "@/main/common/config/appConfig"
import constant             from '@/main/common/Constant';

import HttpServer           from './server/HttpServer';
import IpcServer            from './server/IpcServer';

const logger = new Logger("ddm-ApiExportor");

/**
 * 响应对象
 * @property {boolean} success 是否成功
 * @property {*} data 响应数据
 * @property {string} errorMessage 错误信息
 * @property {string} requestId 请求ID
 */
class Response{
    constructor(success, data, errorMessage){
        this.success = success;
        this.data = data;
        this.errorMessage = errorMessage;
    }

    setRequestId(requestId){
        this.requestId = requestId;
    }
}

/**
 * API导出器
 * 提供渲染进程调用主进程模块的方法
 * 
 */
class ApiExportor {

    /** 已经注册过的模块 */
    #alreadyRegisteredModules = new Map();

    constructor(){
        this.server = (constant.IS_DEVELOPMENT || appConfig.getProperty('developer-mode')) ? new HttpServer() : new IpcServer();
        this.server.startListener(this);
    }

    /**
     * 调用主进程中某个模块的方法
     * @param {string} moduleName 模块名称
     * @param {string} method 模块中的方法名称
     * @param {object[]} args 调用参数
     * @returns {Promise<Response>}
     */
    async invokeMethod(moduleName, method, args){
        try{
            let obj = this.#alreadyRegisteredModules.get(moduleName);
            
            let result = Reflect.apply(obj[method], obj, args)
            if(result instanceof Promise){
                let data = await result;
                return new Response(true, data);
            }

            return new Response(true, result);
        }catch(e){
            logger.error(`调用接口异常 moduleName:${moduleName}, method:${method}, args:${JSON.stringify(args)}`, e);
            return new Response(false, null, e.message);
        }
    }
    
    /**
     * 暴露一个模块，供渲染进程调用
     * @param {string} moduleName 
     * @param {object} target 
     */
    exportService(moduleName, target) {
        // 模块名不能为空
        if (!moduleName) {
            throw new Error("模块必须拥有一个模块名，请在对象中配置name值");
        }

        if(!target) {
            throw new Error("target对象不能为空");
        }
    
        this.#alreadyRegisteredModules.set(moduleName, target);
        logger.info(`API Exportor module: ${moduleName}`);
    }
}

export default new ApiExportor();
