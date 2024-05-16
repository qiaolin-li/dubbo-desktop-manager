import common from "./common";
const axios = require('axios').default;
import configuration from '@/main/common/utils/Configuration';
import i18n from '@/main/common/i18n'
import qs from 'qs'
import paramGenerator from "@/main/dubbo/generator/param/index.js";

async function getServiceList(registryConfig) {

    let params = {
        pageNo: 1,
        pageSize: 100,
        namespaceId: registryConfig.namespaceId || ""
    }
    // `http://127.0.0.1:8848/nacos/v1/ns/service/list?pageNo=1&pageSize=20`
    let url = `${registryConfig.address}/nacos/v1/ns/service/list`

    let array = new Array();
    let count = 0;
    do {
        let data = await doGetServiceList(url, params);
        // 异常？
        if (!data.count) {
            break;
        }

        for (let i = 0; i < data.doms.length; i++) {

            // doms的每个元素： "providers:org.apache.dubbo.demo.DemoService::",
            let serviceName = data.doms[i];

            let datas = serviceName.split(":");

            // 不是提供者，忽略
            if (datas[0] != "providers") {
                continue;
            }

            array.push(new common.ServiceInfo(datas[1], serviceName, datas.length == 4 ? datas[3] : ""));
        }

        count = data.doms.length;
        params.pageNo++;
    } while (count == params.pageSize);

    return Promise.resolve(array);
}


async function doGetServiceList(url, params) {
    try {
        let response = await axios.get(url, {params});
        return response.data;
    } catch(error){
        throw new Error(i18n.t("connect.exportService.nacos.getServiceList.error", { e: error}));
    }
}

async function getProviderList(serviceName, registryConfig) {
    // http://127.0.0.1:8848/nacos/v1/ns/instance/list
    let url = `${registryConfig.address}/nacos/v1/ns/instance/list`;

    let params = {
        serviceName: serviceName,
        namespaceId: registryConfig.namespaceId || ""
    }

    try {
        let response = await axios.get(url, { params});

        if (!response.data || !response.data.hosts) {
            return [];
        }

        let array = new Array();
        for (let i = 0; i < response.data.hosts.length; i++) {
            const host = response.data.hosts[i];

            let providerInfo = parseProvderInfo(host);

            let disableInfo = await getDisableInfo(registryConfig, providerInfo);
            if (disableInfo && disableInfo.find(item => item === '0.0.0.0' || item === providerInfo.address)) {
                providerInfo.disabled = true;
                providerInfo.disabledType = "service";
            }

            const metadata = await getMetaData(providerInfo, registryConfig);
            const methodList = [];
            if(metadata){
                providerInfo.metadata = metadata;
                metadata.methods.forEach(method => {
                    methodList.push({
                        ...method,
                        defaultParameter: JSON.stringify(paramGenerator.generateParam(metadata, method.name), null, 2) || "[]",
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
        throw new Error(i18n.t("connect.exportService.nacos.getProviderList.error", { e: error}));
    }
}



function parseProvderInfo(data) {
    let metadata = data.metadata || [];

    return new common.ProviderInfo({
        application: metadata.application,
        protocol: metadata.protocol,
        ip: data.ip,
        port: data.port,
        serviceName: metadata.interface,
        methods: metadata.methods.split(","),
        generic: metadata.generic,
        version: metadata.version,
        revision: metadata.revision,
        dubboVersion: metadata.release,
        deprecated: metadata.deprecated,
        weight: data.weight,
        enabled: data.enabled,
        group: metadata.group
    });
}


async function getConsumerList(serviceName, registryConfig) {

    // http://127.0.0.1:8848/nacos/v1/ns/instance/list
    let url = `${registryConfig.address}/nacos/v1/ns/instance/list`;

    let params = {
        serviceName: serviceName,
        namespaceId: registryConfig.namespaceId || ""
    }

    try {
        let response = await axios.get(url, { params });
    
        if (!response.data || !response.data.hosts) {
            return [];
        }
    
        let array = new Array();
        for (let i = 0; i < response.data.hosts.length; i++) {
            const host = response.data.hosts[i];
            array.push(parseProvderInfo(host))
        }
    
        return array;
    } catch(error){
        throw new Error(i18n.t("connect.exportService.nacos.getConsumerList.error", { e: error}));
    }
}

async function getMetaData(providerInfo, registryConfig) {

    // http://127.0.0.1:8848/nacos/v1/cs/configs
    let url = `${registryConfig.address}/nacos/v1/cs/configs`;

    let {
        application,
        serviceName,
        version,
        group
    } = providerInfo;
    version = version || "";
    let dataId = `${serviceName}:${version}:${group || ''}:provider:${application}`;

    let params = {
        dataId: dataId,
        group: "dubbo",
        namespaceId: registryConfig.namespaceId || "",
        tenant: registryConfig.namespaceId || ""
    }

    try {
        let response = await axios.get(url, { params });
        return response.data || [];
    } catch(error){
        if(error.response.status === 404){
            return null;
        }
        throw new Error(i18n.t("connect.exportService.nacos.getMetaData.error", { e: error}));
    }
}


// eslint-disable-next-line no-unused-vars
async function getCurrentConfiguration(registryConfig, providerInfo) {

    let config = await getConfiguration(registryConfig, providerInfo);


    let configData = configuration.yamlToJSON(config);

    if(configData){
        return configData;
    }

    return configuration.createDefaultConfiguration(providerInfo.serviceName);
}



// eslint-disable-next-line no-unused-vars
async function getConfiguration(registryConfig, providerInfo) {

    // http://127.0.0.1:8848/nacos/v1/cs/configs
    let url = `${registryConfig.address}/nacos/v1/cs/configs`;

    let {
        serviceName,
        version,
        group
    } = providerInfo;
    version = version || "";
    let dataId = `${serviceName}:${version}:${group || ''}.configurators`;

    let params = {
        dataId: dataId,
        group: "dubbo",
        namespaceId: registryConfig.namespaceId || "",
        tenant: registryConfig.namespaceId || ""
    }

    try {
        let response = await axios.get(url, { params  })
        return response.data || null;
    } catch(error) {
        if (error.response.status == 404) {
            return null;
        }
        throw new Error(i18n.t("connect.exportService.nacos.getMetaData.error", { e: error}));
    }
}

// eslint-disable-next-line no-unused-vars
async function saveConfiguration(registryConfig, providerInfo, doc) {
    // http://127.0.0.1:8848/nacos/v1/cs/configs
    let url = `${registryConfig.address}/nacos/v1/cs/configs`;

    let params = {
        dataId: buildDataId(providerInfo),
        group: "dubbo",
        namespaceId: registryConfig.namespaceId || "",
        tenant: registryConfig.namespaceId || "",
    }

    try {
        // 有配置项，保存，反之删除
        if(doc && doc.configs && doc.configs.length > 0){
            params.content = configuration.JSONToYaml(doc);
            await axios.post(url, qs.stringify(params));
        } else {
            await axios.delete(url, { params });
        }
    } catch (error) {
        throw new Error(i18n.t("connect.exportService.nacos.saveConfiguration.error", { e: error}));
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



function buildDataId(providerInfo) {
    let {
        serviceName,
        version,
        group
    } = providerInfo;
    version = version || "";
    return `${serviceName}:${version}:${group || ''}.configurators`;
}

export default {
    getServiceList,
    getProviderList,
    getConsumerList,
    getConfiguration,
    getCurrentConfiguration,
    saveConfiguration
}