import {
    ipcMain
} from 'electron'

const COMMUNICATION_CHANEL = "ipc-main-unify";

const ALREADY_REGISTERED_MODULES = new Map();

 function startListener() {
    // method
    ipcMain.on(COMMUNICATION_CHANEL, async (event, invocation) => {
        let {moduleName, method, args} = invocation;

        try{
            let obj = ALREADY_REGISTERED_MODULES.get(moduleName);
            let result = Reflect.apply(obj[method], obj, args)

            if(result instanceof Promise){
                let data = await result;
                let rs = {
                    isPromise : true,
                    data
                }
                event.returnValue = rs
                return;
            }
            event.returnValue = {
                data:result
            }
        }catch(e){
            event.returnValue = new Error("调用失败 " + e);
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


startListener() 
export default {
    registry
}
