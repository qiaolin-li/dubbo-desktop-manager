import Constant from '../common/Constant';
import logger  from '@/main/common/logger';

import HttpServer from './server/HttpServer';
import IpcServer from './server/IpcServer';

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
        this.server = Constant.IS_DEVELOPMENT ? new HttpServer() : new IpcServer();
        this.server.startListener(this);
    }

    exportApi() {
        //第一个参数表示相对的文件目录，第二个参数表示是否包括子目录中的文件，第三个参数表示引入的文件匹配的正则表达式。
        const context = require.context('@/main/', true, /remoteApi\.js$/);
        context.keys().forEach((key) => {
            let modules = context(key).default || [];
            modules.forEach(module => {
                this.registry(module.target, module.name);
                logger.info(`API Exportor module: ${module.name}`);
            });
        })
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
    
    registry(target, moduleName) {
        moduleName = moduleName || target.name;
    
        // 模块名不能为空
        if (!moduleName) {
            throw new Error("模块必须拥有一个模块名，请在对象中配置name值");
        }
    
        // 缓存模块
        ALREADY_REGISTERED_MODULES.set(moduleName, target);
    }
}


export default new ApiExportor();
