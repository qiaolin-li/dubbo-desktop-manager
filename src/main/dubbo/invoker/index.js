import telnetInvoker from "./telnetInvoker";
import javaInvoker from "./javaInvoker";
import dubboAdminInvoker from "./dubboAdminInvoker";
import invokeHisotryRecord from "@/main/repository/invokeHistoryRepository.js";
import appConfig from "@/main/common/config/appConfig.js";
import common from "./common.js";
import connectRepository from "@/main/repository/connectRepository.js";
import windowHolder         from '@/main/common/holder/WindowHolder.js';

async function invokeMethod(registryCenterId, uniqueServiceName, provder, metadata, method, code, currentInvoker) {
    let registryConfig = await connectRepository.findById(registryCenterId);

    let result = await doInvokeMethod(registryConfig, provder, metadata, method, code, currentInvoker);

    const interfaceName =  registryConfig.type === 'dubbo-admin' ? provder.serviceName.split(":")[0] : provder.serviceName;

    // 保存调用记录
    let invokeHistory = {
        registryCenterId,
        serviceName: interfaceName,
        uniqueServiceName,
        address: provder.address,
        method: method,
        param: code,
        result: JSON.stringify(result.data),
    };
    await invokeHisotryRecord.save(invokeHistory);
    windowHolder.getWindow().webContents.send('newInvokeHisotryRecordEvent')

    return result;
}

async function doInvokeMethod(registryConfig, provder, metadata, method, code, currentInvoker) {
  
    if(registryConfig.type === 'dubbo-admin'){
        return dubboAdminInvoker.invokeMethod(registryConfig, provder, metadata, method, code);
    }

    // 执行器类型
    let invokerType = currentInvoker || appConfig.getProperty("invokerType") || "telnet";

    if ("telnet" === invokerType) {
        return telnetInvoker.invokeMethod(provder, metadata, method, code);
    }

    return javaInvoker.invokeMethod(provder, metadata, method, code);
}


/** 
 * 构建invoke命令 
 */
function buildInvokeCommand(invokeParams) {
    return common.buildInvokeCommand(invokeParams);
}

let data = {
    buildInvokeCommand,
    invokeMethod,
}

export default data;