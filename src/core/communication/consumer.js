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
                let result = ipcRenderer.sendSync(COMMUNICATION_CHANEL, invocation);

                if(result.isPromise){
                    return Promise.resolve(result.data)
                }
                // 调用方法的结果
                return result;
            }
        }
    };
    return new Proxy(target, handler);
}

export default {
    wrapper
}