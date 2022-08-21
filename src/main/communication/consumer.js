const {
    ipcRenderer
} = require('electron')

const COMMUNICATION_CHANEL = "ipc-main-unify";
const COMMUNICATION_CONSUMER_CHANEL = "ipc-rendenerer-unify";

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
                const callbackChannel = `${COMMUNICATION_CONSUMER_CHANEL}-${moduleName}-${method}-${Math.random()}`;
                // 将参数包装
                let invocation = {
                    moduleName,
                    method,
                    callbackChannel : callbackChannel,
                    args
                }
                // 和主进程进行通讯
                ipcRenderer.send(COMMUNICATION_CHANEL, invocation);
                let data = await new Promise((resolve, reject) => {
                    ipcRenderer.on(callbackChannel, (event, response) => {
                        if (!response.success) {
                            require('element-ui').Message({
                                type: "error",
                                message: response.errorMessage,
                            });
                            reject(new Error(response.errorMessage));
                        }

                        // 调用方法的结果
                        return resolve(response.data);
                    });
                });

                return data;
            }
        }
    };
    return new Proxy(target, handler);
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

export default {
    wrapper
}