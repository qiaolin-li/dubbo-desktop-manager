import axios                    from 'axios';
import { Message }              from 'element-ui';


class Consumer{

    constructor(){
        this.invoker = (window.constant.IS_DEVELOPMENT || appRuntime.isDeveloperMode()) ? new HttpClient() : new IpcClient();
    }


    /**
     * 包装对象，转发调用方法到main进程
     * @param {*} moduleName 
     * @returns target
     */
    createProxy(moduleName) {
        // 模块名不能为空
        if (!moduleName) {
            throw new Error("模块必须拥有一个模块名，请在对象中配置name值");
        }
        
        const invoker = this.invoker;
        const handler = {
            // eslint-disable-next-line no-unused-vars
            get(target, method, proxy) {
                // let result = target[method];
    
                // if (typeof result != "function") {
                //     return result;
                // }

                return async function () {
                    return await invoker.invoke(moduleName, method, [...arguments])
                };
            }
        };
        return new Proxy({}, handler);
    }
}

class HttpClient{
    async invoke(moduleName, method, args){
        const response = await axios.post(`http://127.0.0.1:${window.constant.API_HTTP_PORT}/api/${moduleName}/${method}`, args);
        if (!response.data.success) {
            Message({
                type: "error",
                message: response.data.errorMessage,
            });
            throw new Error(response.data.errorMessage);
        }
        return response.data.data;
    }

}



class IpcClient{

    #unifyInvoker = window.createUnifyInvoker();

    constructor(){
        this.waitResponsePromiseMap = new Map();
    
        // 注册监听通道
        this.#unifyInvoker.on(this.handlerResponse.bind(this));

        console.info("消费者监听器注册成功");
    }

    invoke(moduleName, method, args){
        const requestId = `${moduleName}-${method}-${Math.random()}`;
        // 将参数包装
        let invocation = {
            moduleName,
            method,
            requestId : requestId,
            args,
        }
        
        let data = new Promise((resolve, reject) => {
            this.waitResponsePromiseMap.set(requestId, {
                resolve, 
                reject
            });
        });

        // 和主进程进行通讯
        this.#unifyInvoker.send(invocation);
            
        return data;
    }

    handlerResponse(response){
        let waitResponsePromise = this.waitResponsePromiseMap.get(response.requestId);
        
        try {
            if(!waitResponsePromise){
                console.warn("消费者监听器收到未能处理的消息" + JSON.stringify(response));
                return;
            }
            
            if (!response.success) {
                Message({
                    type: "error",
                    message: response.errorMessage,
                });
                waitResponsePromise.reject(new Error(response.errorMessage));
                return;
            }
    
            // 调用方法的结果
            return waitResponsePromise.resolve(response.data);
        } finally {
            this.waitResponsePromiseMap.delete(response.requestId);
        }
    }
}

export default new Consumer();
