import telnetInvoker from "./telnetInvoker";
import javaInvoker from "./javaInvoker";
import invokeHisotryRecord from "@/main/repository/invokeHistoryRepository.js";
import appConfig from "@/main/common/config/appConfig.js";
import common from "./common.js";

async function invokeMethod(provder, metadata, method, code, currentInvoker) {

    let result = doInvokeMethod(provder, metadata, method, code, currentInvoker);

    // 保存调用记录
    let invokeHistory = {
        serviceName: provder.serviceName,
        method: method,
        param: code,
        result: JSON.stringify(result.data),
    };
    await invokeHisotryRecord.save(invokeHistory);

    return result;
}

function doInvokeMethod(provder, metadata, method, code, currentInvoker) {
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