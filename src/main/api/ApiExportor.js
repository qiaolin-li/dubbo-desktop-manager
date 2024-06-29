import Constant from '../common/Constant';
import { ipcMain } from 'electron'
import pkg from '../../../package.json'
import logger  from '@/main/common/logger';
import http from 'http';


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
        this.invoker = Constant.IS_DEVELOPMENT ? new HttpServer() : new IpcServer();
        this.invoker.startListener(this);
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


class HttpServer {
    startListener(apiExportor) {
        // 创建服务器
        http.createServer(async (request, response) => {  
            const moduleName = request.url.substring('/api/'.length).split('/')[0];
            const method = request.url.substring('/api/'.length).split('/')[1];
            let data = '';
            request.on('data', chunk => data += chunk);
            request.on('end', async () => {
                response.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});    
                response.write(JSON.stringify(await apiExportor.invokeMethod(moduleName, method,JSON.parse(data))));        
                response.end();
            })
        }).listen(pkg.port);
            
        console.log(`Server running at http://127.0.0.1:${pkg.port}/`);
    }

}

class IpcServer {
    startListener(apiExportor) {
        const COMMUNICATION_CHANNEL = "ipc-main-unify";
        ipcMain.on(COMMUNICATION_CHANNEL, async (event, invocation) => {
            let {moduleName, method, args, replyChannel, requestId} = invocation;
            const response = await apiExportor.invokeMethod(moduleName, method, args);
            response.setRequestId(requestId);
            event.sender.send(replyChannel, await response);
        })
    }
}

export default new ApiExportor();
