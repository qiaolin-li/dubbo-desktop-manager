const { ipcRenderer } = require('electron')
const axios = require('axios').default;
import pkg from "../../../package.json";

const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production'

const COMMUNICATION_CHANEL = "ipc-main-unify";
const COMMUNICATION_CONSUMER_CHANNEL = `ipc-rendenerer-unify_${Math.random()}`;
const waitResponsePromiseMap = new Map();

class Consumer{

    constructor(){
        this.invoker = IS_DEVELOPMENT ? new HttpClient() : new IpcClient();
    }

    wrapper(target, moduleName) {
        moduleName = moduleName || target.name;
    
        // 模块名不能为空
        if (!moduleName) {
            throw new Error("模块必须拥有一个模块名，请在对象中配置name值");
        }
        
        const invoker = this.invoker;
        const handler = {
            get(target, method, proxy) {
                let result = target[method];
    
                if (typeof result != "function") {
                    return result;
                }

                return async function () {
                    return await invoker.invoke(moduleName, method, [...arguments])
                };
            }
        };
        return new Proxy(target, handler);
    }
}

class HttpClient{
    async invoke(moduleName, method, args){
        const response = await axios.post(`http://127.0.0.1:${pkg.port}/api/${moduleName}/${method}`, args);
        if (!response.data.success) {
            require('element-ui').Message({
                type: "error",
                message: response.data.errorMessage,
            });
            return new Error(response.data.errorMessage);
        }
        return response.data.data;
    }

}

class IpcClient{

    constructor(){
        this.waitResponsePromiseMap = new Map();
    
        // 注册监听通道
        ipcRenderer.on(COMMUNICATION_CONSUMER_CHANNEL, (event, response) => this.handlerResponse(response));
        console.info("消费者监听器注册成功");
    }

    invoke(moduleName, method, args){
          const requestId = `${COMMUNICATION_CONSUMER_CHANNEL}-${moduleName}-${method}-${Math.random()}`;
          // 将参数包装
          let invocation = {
              moduleName,
              method,
              requestId : requestId,
              args,
              replyChannel: COMMUNICATION_CONSUMER_CHANNEL,
          }
          
        // 和主进程进行通讯
        ipcRenderer.send(COMMUNICATION_CHANEL, invocation);
            
        let data = new Promise((resolve, reject) => {
            this.waitResponsePromiseMap.set(requestId, {
                resolve, 
                reject
            });
        });
        return data;
    }

    handlerResponse(response){
        let waitResponsePromise = this.waitResponsePromiseMap.get(response.requestId);

        if(!waitResponsePromise){
            console.warn("消费者监听器收到未能处理的消息" + JSON.stringify(response));
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
}

export default new Consumer();