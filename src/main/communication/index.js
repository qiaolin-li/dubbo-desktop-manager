import {
    ipcMain
} from 'electron'
import {getWindow} from '@/main/holder/WindowHolder.js';


const COMMUNICATION_CHANEL = "ipc-main-unify";

const ALREADY_REGISTERED_MODULES = new Map();

 function startListener() {
    // method
    ipcMain.on(COMMUNICATION_CHANEL, async (event, invocation) => {
        let {moduleName, method,callbackChannel, args} = invocation;

        try{
            let obj = ALREADY_REGISTERED_MODULES.get(moduleName);
            
            let result = Reflect.apply(obj[method], obj, args)
            
            let window = getWindow();
            if(result instanceof Promise){
                let data = await result;
                window.webContents.send(callbackChannel, new Response(true, data));
                return;
            }
            window.webContents.send(callbackChannel, new Response(true, result));
        }catch(e){
            console.log("调用接口异常", e);
            window.webContents.send(callbackChannel, new Response(false, null, e.message));
        }
    })
}

function registry(target, moduleName) {
    moduleName = moduleName || target.name;

    // 模块名不能为空
    if (!moduleName) {
        throw new Error("模块必须拥有一个模块名，请在对象中配置name值");
    }

    // 缓存模块
    ALREADY_REGISTERED_MODULES.set(moduleName, target);
}

function Response(success, data, errorMessage){
    this.success = success;
    this.data = data;
    this.errorMessage = errorMessage;
}

startListener() 
export default {
    registry
}
