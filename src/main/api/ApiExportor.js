import {
    ipcMain
} from 'electron'
import windowHolder  from '@/main/common/holder/WindowHolder.js';

const COMMUNICATION_CHANEL = "ipc-main-unify";
const COMMUNICATION_CONSUMER_CHANEL = "ipc-rendenerer-unify";

const ALREADY_REGISTERED_MODULES = new Map();

class Response{
    constructor(requestId, success, data, errorMessage){
        this.requestId = requestId;
        this.success = success;
        this.data = data;
        this.errorMessage = errorMessage;
    }
}

class ApiExportor {

    constructor(){
        this.startListener();
    }

    startListener() {
        ipcMain.on(COMMUNICATION_CHANEL, async (event, invocation) => this.invokeMethod(event, invocation))
    }

    async invokeMethod(event, invocation){
        const currentWindow = event.sender.getOwnerBrowserWindow();
        let {moduleName, method,requestId, args} = invocation;
    
        try{
            let obj = ALREADY_REGISTERED_MODULES.get(moduleName);

            if(obj == null){

            }
            
            let result = Reflect.apply(obj[method], obj, args)
            
            if(result instanceof Promise){
                let data = await result;
                currentWindow.webContents.send(COMMUNICATION_CONSUMER_CHANEL, new Response(requestId, true, data));
                return;
            }
            currentWindow.webContents.send(COMMUNICATION_CONSUMER_CHANEL, new Response(requestId, true, result));
        }catch(e){
            console.log(`调用接口异常 moduleName:${moduleName}, method:${method}, args:${JSON.stringify(args)}`, e);
            currentWindow.webContents.send(COMMUNICATION_CONSUMER_CHANEL, new Response(requestId, false, null, e.message));
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
