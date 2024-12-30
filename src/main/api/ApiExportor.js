import logger        from '@/main/common/logger';
import appConfig     from "@/main/common/config/appConfig"
import constant      from '@/main/common/Constant';

import HttpServer    from './server/HttpServer';
import IpcServer     from './server/IpcServer';

const ALREADY_REGISTERED_MODULES = new Map();
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

class ApiExportor {

    constructor(){
        this.server = (constant.IS_DEVELOPMENT || appConfig.getProperty('developer-model')) ? new HttpServer() : new IpcServer();
        this.server.startListener(this);
    }

    async invokeMethod(moduleName, method, args){
        try{
            let obj = ALREADY_REGISTERED_MODULES.get(moduleName);
            
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
    
    registry(moduleName, target) {
        // 模块名不能为空
        if (!moduleName) {
            throw new Error("模块必须拥有一个模块名，请在对象中配置name值");
        }
    
        logger.info(`API Exportor module: ${moduleName}`);
        // 缓存模块
        ALREADY_REGISTERED_MODULES.set(moduleName, target);
    }
}


export default new ApiExportor();
