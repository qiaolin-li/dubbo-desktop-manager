const {
    ipcRenderer
} = require('electron')

const COMMUNICATION_CHANEL = "ipc-main-unify";
const COMMUNICATION_CONSUMER_CHANEL = "ipc-rendenerer-unify";
const waitResponsePromiseMap = new Map();


class Consumer{

    constructor(){
        // 启动监听
        this.startListener();
    }

    startListener(){
        // 注册监听通道
        ipcRenderer.on(COMMUNICATION_CONSUMER_CHANEL, (event, response) => this.handlerResponse(event, response));
    
        console.log("消费者监听器注册成功");
    }

    handlerResponse(event, response){
        let waitResponsePromise = waitResponsePromiseMap.get(response.requestId);

        if(!waitResponsePromise){
            console.log("消费者监听器收到未能处理的消息" + JSON.stringify(response));
            return;
        }

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
      
    }

    wrapper(target, moduleName) {
        moduleName = moduleName || target.name;
    
        // 模块名不能为空
        if (!moduleName) {
            throw new Error("模块必须拥有一个模块名，请在对象中配置name值");
        }
    
        const handler = {
            get(target, method, proxy) {
                let result = target[method];
    
                if (typeof result != "function") {
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
}





export default new Consumer();