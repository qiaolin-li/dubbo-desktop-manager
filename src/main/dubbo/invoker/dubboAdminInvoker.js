import common from "./common.js";
const axios = require('axios').default;
import i18n from '@/main/common/i18n'
import JSONFormater from "@/main/common/utils/JSONFormater";

async function getToken(registryConfig) {
    let params = {
        userName: registryConfig.username,
        password: registryConfig.password,
    }

    // `http://127.0.0.1:8848/api/dev/user/login`
    const url = `${registryConfig.address}/user/login`;

    let response = await axios.get(url, {
        params
    });
    return response.data;
}


async function invokeMethod(registryConfig, provder, metadata, method, code) {
    const startTime = new Date().getTime();

    const data = {
        service: provder.serviceName,
        method: method,
        parameterTypes: getMethodParameterTypes(metadata, method),
        params: JSON.parse(code)
    }

    // `http://127.0.0.1:8848/api/dev/test`
    let url = `${registryConfig.address}/test`


    try {
        let response = await axios.post(url, data, {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': await getToken(registryConfig)
            }
        });
    
        return new common.InvokeResult(JSONFormater(JSON.stringify(response.data)), new Date().getTime() - startTime);
    } catch (error) {
        const message = i18n.t("dubbo.invokePage.callDubboAdminError", {  info: error.response.data.message });
        return new common.InvokeResult(message, new Date().getTime() - startTime);
    }
   
}


function getMethodParameterTypes(metadata, method) {
    let methodInfo = metadata.methods.find(m => m.name == method);
    return methodInfo.parameterTypes.map(paramterType => {
        if (paramterType.indexOf("<") >= 0) {
            return paramterType.substring(0, paramterType.indexOf("<"));

        }
        return paramterType;
    });
}


export default {
    invokeMethod
}