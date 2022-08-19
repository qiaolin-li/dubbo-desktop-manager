const {
    ipcRenderer
} = require('electron')


const COMMUNICATION_CHANEL = "ipc-main-unify";

function wrapper(target, moduleName) {
    moduleName = moduleName || target.name;

    // 模块名不能为空
    if (!moduleName) {
        throw new Error("模块必须拥有一个模块名，请在对象中配置name值");
    }

    var handler = {
        get(target, method, proxy) {
            let result = target[method];

            if(isMainProgress()){
                return result;
            }
            

            if (typeof result != "function") {
                return result;
            }

            if(result.name == "install"){
                return result;
            }

            return function () {
                // 将所有参数转为数组
                const args = [...arguments];

                // 将参数包装
                let invocation = {
                    moduleName,
                    method,
                    args
                }
                // 和主进程进行通讯
                let repsonse = ipcRenderer.sendSync(COMMUNICATION_CHANEL, invocation);

                if(!repsonse.success){
                    require('element-ui').Message({
                        type: "error",
                        message: repsonse.errorMessage,
                    });
                    throw new Error(repsonse.errorMessage);
                }
                // 调用方法的结果
                return repsonse.data;
            }
        }
    };
    return new Proxy(target, handler);
}


function isMainProgress(){
    try {
        window.name;
        return false;
    } catch(e){
        // 忽略
        return true;
    }
}

export default {
    wrapper
}