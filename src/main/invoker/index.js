import telnetInvoker from "./telnetInvoker";
import javaInvoker from "./javaInvoker";
import invokeHisotryRecord from "@/main/repository/invokeHistoryRepository.js";
import consumer from "@/main/communication/consumer.js";
import appConfig from "@/main/repository/appConfig.js";

async function invokeMethod(provder, metadata, method, code) {

    let result = doInvokeMethod(provder, metadata, method, code);

    // 保存调用记录
    let invokeHistory = {
        serviceName: provder.serviceName,
        method: method,
        param: code
    };
    await invokeHisotryRecord.save(invokeHistory);

    return result;
}

function doInvokeMethod(provder, metadata, method, code) {
    // 执行器类型
    let invokerType = appConfig.getProperty("invokerType") || "telnet";

    if ("telnet" === invokerType) {
        return telnetInvoker.invokeMethod(provder, metadata, method, code);
    }

    // throw new Error("哈哈哈哈");
    return javaInvoker.invokeMethod(provder, metadata, method, code);
}


/** 
 * 构建invoke命令 
 */
function buildInvokeCommand(invokeParams) {
    return telnetInvoker.buildInvokeCommand(invokeParams);
}

let data = {
    name: "invoker",
    buildInvokeCommand,
    invokeMethod,
    install(communication) {
        communication.registry(data);
    }
}

export default consumer.wrapper(data);