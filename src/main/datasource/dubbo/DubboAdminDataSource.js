const axios = require('axios').default;
import common               from "@/main/datasource/dubbo/common.js";
import configuration        from '@/main/common/utils/Configuration';
import i18n                 from '@/main/common/i18n'
import JSONFormater         from "@/main/common/utils/JSONFormater";
import InvokeUtils          from "@/main/common/utils/InvokeUtils.js";
import urlUtils             from "@/main/common/utils/urlUtils.js";
import appCore              from '@/main/AppCore.js';

async function getToken(registryConfig) {
    let params = {
        userName: registryConfig.username,
        password: registryConfig.password,
    }

    // `http://127.0.0.1:8848/api/dev/user/login`
    const url = `${registryConfig.address}/user/login`;
    let response = await axios.get(url, { params });
    return response.data;
}


async function getServiceList(registryConfig) {
    // `http://127.0.0.1:8848/api/dev/services`
    let url = `${registryConfig.address}/services`

    let array = new Array();
    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': await getToken(registryConfig) }
        });

        for (let i = 0; i < response.data.length; i++) {

            // doms的每个元素： "org.apache.dubbo.demo.DemoService:1.0.0",
            let serviceName = response.data[i];
            let datas = serviceName.split(":");

            array.push(new common.ServiceInfo(datas[0], serviceName, ""));
        }
    } catch (error) {
        throw new Error(i18n.t("connect.exportService.nacos.getServiceList.error", { e: error}));
    }

    return array;
}


async function getServiceData(serviceName, registryConfig) {

    // `http://127.0.0.1:8848/api/dev/service/${org.apache.dubbo.demo.DemoService}`
    const url = `${registryConfig.address}/service/${serviceName}`
    const response = await axios.get(url, {
        headers: { 'Authorization': await getToken(registryConfig) }
    });
    return response.data;
}


async function getProviderList(serviceName, registryConfig) {
    try {
        const data = await getServiceData(serviceName, registryConfig);

        let array = new Array();
        for (let i = 0; i < data.providers.length; i++) {
            if (data.providers[i].registrySource !== 'INTERFACE') {
                continue;
            }

            let providerInfo = parseProvderInfo(data.providers[i]);

            let disableInfo = await getDisableInfo(registryConfig, providerInfo);
            if (disableInfo && disableInfo.find(item => item === '0.0.0.0' || item === providerInfo.address)) {
                providerInfo.disabled = true;
                providerInfo.disabledType = "service";
            }

            const methodList = [];
            if(data.metadata){
                providerInfo.metadata = data.metadata;
                data.metadata.methods.forEach(method => {
                    methodList.push({
                        ...method,
                        defaultParameter: JSON.stringify(appCore.getParamGenerator().generateParam(data.metadata, method.name), null, 2) || "[]",
                    });
                })
            } else {
                providerInfo.methods.forEach(method => {
                    methodList.push({
                        name: method,
                        parameterTypes: null,
                        defaultParameter: "[]",
                        returnType: null
                    });
                });
            }
            providerInfo.methods = methodList;
  
            array.push(providerInfo)
        }

        return array;
    } catch (error) {
        throw new Error(i18n.t("connect.exportService.nacos.getProviderList.error", { e: error }));
    }
}



async function getConsumerList(serviceName, registryConfig) {
    try {
        const data = await getServiceData(serviceName, registryConfig);

        let array = new Array();
        for (let i = 0; i < data.consumers.length; i++) {
            array.push(parseConsumerInfo(data.consumers[i]))
        }

        return array;
    } catch (error) {
        throw new Error(i18n.t("connect.exportService.nacos.getConsumerList.error", {
            e: error
        }));
    }
}


async function getMetaData(providerInfo, registryConfig) {
    try {
        const data = await getServiceData(providerInfo.serviceName, registryConfig);

        return data.metadata || {};
    } catch (error) {
        throw new Error(i18n.t("connect.exportService.nacos.getMetaData.error", {
            e: error
        }));
    }
}


/**
 * 
 * @param {string} serviceName 
 * @param {string[]} versions 多个版本
 */
async function getDisableInfo(registryConfig, providerInfo) {
    let doc = await getCurrentConfiguration(registryConfig, providerInfo);
    let addressList = [];
    if (doc && doc.configs) {
      let configs = doc.configs;
      for (let j = 0; j < configs.length; j++) {
        let config = configs[j];
        // 规则不是开启的，忽略
        if (!config.enabled) {
          continue;
        }

        if (!config.parameters || !config.parameters.disabled || config.parameters.disabled != true) {
          continue;
        }

        addressList = addressList.concat(config.addresses);
      }
    }

  return addressList;
}


// eslint-disable-next-line no-unused-vars
async function getCurrentConfiguration(registryConfig, providerInfo) {
    let {
        serviceName,
    } = providerInfo;
    let url = `${registryConfig.address}/rules/override/${serviceName}:/`;

    try {
        let response = await axios.get(url, {
            headers: {
                'Authorization': await getToken(registryConfig)
            }
        });
        return response.data || null;
    } catch (error) {
        if (error.response.status == 404) {
            return null;
        }
        throw new Error(i18n.t("connect.exportService.nacos.getMetaData.error", {
            e: error
        }));
    }
}



// eslint-disable-next-line no-unused-vars
async function getConfiguration(registryConfig, providerInfo) {
    let config = await getCurrentConfiguration(registryConfig, providerInfo);

    if(!config){
        config = configuration.createDefaultConfiguration(providerInfo.serviceName);
    }
    
    return  configuration.JSONToYaml(config);

}

// eslint-disable-next-line no-unused-vars
async function saveConfiguration(registryConfig, providerInfo, doc) {

    let {
        serviceName,
    } = providerInfo;
    let url = `${registryConfig.address}/rules/override/${serviceName}:`;

    try {
        // 有配置项，保存，反之删除
        if (doc && doc.configs && doc.configs.length > 0) {
            await axios.put(url, doc, {
                headers: {
                    'Authorization': await getToken(registryConfig)
                }
            });
        } else {
            await axios.delete(url, {
                'Authorization': await getToken(registryConfig)
            });
        }

    } catch (error) {
        if (error.response.status == 404) {
            return null;
        }
        throw new Error(i18n.t("connect.exportService.nacos.getMetaData.error", {
            e: error
        }));
    }
}


function parseProvderInfo(data) {
    let urlData = urlUtils.parseURL(`dubbo://${data.address}/?${data.parameters}`);
    return new common.ProviderInfo({
        application: data.application,
        protocol: urlData.protocol,
        ip: urlData.host,
        port: urlData.port,
        serviceName: data.service,
        methods: urlData.params.methods.split(","),
        generic: urlData.params.generic,
        version: urlData.params.version,
        revision: urlData.params.revision,
        dubboVersion: urlData.params.release,
        deprecated: urlData.params.deprecated,
        weight: data.weight,
        enabled: data.enabled,
        group: ""
    });
}


function parseConsumerInfo(data) {
    let urlData = urlUtils.parseURL(`${data.url}?${data.parameters}`);
    let methods = urlData.params.methods || "";
    return new common.ConsumerInfo({
      ip: data.address,
      serviceName: urlData.params.interface,
      application: data.application,
      check: urlData.params.check,
      version: urlData.params.version,
      timeout: urlData.params.timeout,
      enable: urlData.params["qos.enable"],
      revision: urlData.params.revision,
      methods: methods.split(","),
      dubbo: urlData.params.dubbo,
      lazy: urlData.params.lazy,
      pid: urlData.params.pid,
      release: urlData.params.release,
      retries: urlData.params.retries || 2,
      sticky: urlData.params.sticky,
      category: urlData.params.category,
      timestamp: urlData.params.timestamp,
    });
  }



async function invokeMethod(registryConfig, provder, methodInfo, code) {

    const startTime = new Date().getTime();
    const data = {
        service: provder.serviceName,
        method: methodInfo.name,
        parameterTypes: getMethodParameterTypes(methodInfo),
        params: JSON.parse(code)
    }

    // `http://127.0.0.1:8848/api/dev/test`
    const url = `${registryConfig.address}/test`

    try {
        let response = await axios.post(url, data, {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json;charset=UTF-8',
                'Authorization': await getToken(registryConfig)
            }
        });

        let result = response.data;
        if(typeof response.data !== 'string'){
            result = JSONFormater(JSON.stringify(response.data));
        }
    
        return new InvokeUtils.InvokeResult(result, new Date().getTime() - startTime);
    } catch (error) {
        const message = i18n.t("dubbo.invokePage.callDubboAdminError", {  info: error.response.data.message });
        return new InvokeUtils.InvokeResult(message, new Date().getTime() - startTime);
    }
}


function getMethodParameterTypes(methodInfo) {
    return methodInfo.parameterTypes.map(paramterType => {
        if (paramterType.indexOf("<") >= 0) {
            return paramterType.substring(0, paramterType.indexOf("<"));
        }
        return paramterType;
    });
}



export default {
    getServiceList,
    getProviderList,
    getConsumerList,
    getConfiguration,
    getCurrentConfiguration,
    saveConfiguration,
    invokeMethod
}