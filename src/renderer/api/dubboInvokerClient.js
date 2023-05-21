import consumer from './Consumer';

class DubboInvoker {

    async  invokeMethod(registryCenterId, uniqueServiceName, provder, metadata, method, code, currentInvoker) {}

    /** 
     * 构建invoke命令 
     */
    async buildInvokeCommand(invokeParams) {}

}

export default consumer.wrapper(new DubboInvoker(), "dubboInvoke");