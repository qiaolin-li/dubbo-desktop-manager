const {
    ipcRenderer
} = require('electron')

const COMMUNICATION_CHANEL = "ipc-main-unify";
const COMMUNICATION_CONSUMER_CHANEL = "ipc-rendenerer-unify";
const waitResponsePromiseMap = new Map();

function wrapper(target, moduleName) {
    moduleName = moduleName || target.name;

    // 模块名不能为空
    if (!moduleName) {
        throw new Error("模块必须拥有一个模块名，请在对象中配置name值");
    }

    var handler = {
        get(target, method, proxy) {
            let result = target[method];

            if (isMainProgress()) {
                return result;
            }


            if (typeof result != "function") {
                return result;
            }

            if (result.name == "install") {
                return result;
            }

            return async function () {
                // 将所有参数转为数组
                const args = [...arguments];
                const requestId = `${COMMUNICATION_CONSUMER_CHANEL}-${moduleName}-${method}-${Math.random()}`;
                // 将参数包装
                let invocation = {
                    moduleName,
                    method,
                    requestId : requestId,
                    args
                }
                
                // 和主进程进行通讯
                ipcRenderer.send(COMMUNICATION_CHANEL, invocation);

                let data = new Promise((resolve, reject) => {
                    waitResponsePromiseMap.set(requestId, {
                        resolve, 
                        reject
                    });
                });

                return data;
            }
        }
    };
    return new Proxy(target, handler);
}

function startResponseListener(){
    // 和主进程进行通讯
    ipcRenderer.on(COMMUNICATION_CONSUMER_CHANEL, (event, response) => {
        let waitResponsePromise = waitResponsePromiseMap.get(response.requestId);

        try {
            if (!response.success) {
                require('element-ui').Message({
                    type: "error",
                    message: response.errorMessage,
                });
                waitResponsePromise.reject(new Error(response.errorMessage));
            }
    
            // 调用方法的结果
            return waitResponsePromise.resolve(response.data);
        } finally {
            waitResponsePromiseMap.delete(response.requestId);
        }
      
    });

    console.log("消费者监听器注册成功");
}


function isMainProgress() {
    try {
        window.name;
        return false;
    } catch (e) {
        // 忽略
        return true;
    }
}

if(!isMainProgress()){
    // 启动监听
    startResponseListener();
}


export default {
    wrapper
}