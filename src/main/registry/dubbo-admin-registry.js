import common from "./common";
const axios = require('axios').default;
import configuration from '@/main/common/utils/Configuration';
import i18n from '@/main/common/i18n'
import qs from 'qs'
import urlUtils from "@/main/common/utils/urlUtils.js";


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


async function getServiceList(registryConfig) {
    // `http://127.0.0.1:8848/api/dev/services`
    let url = `${registryConfig.address}/services`

    let array = new Array();
    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': await getToken(registryConfig)
            },
        });
        
        const interfaceList = response.data;
        for (let i = 0; i < interfaceList.length; i++) {

            // doms的每个元素： "org.apache.dubbo.demo.DemoService:1.0.0",
            let serviceName = interfaceList[i];

            let datas = serviceName.split(":");

            array.push(new common.ServiceInfo(datas[0], serviceName, ""));
        }

    } catch (error) {
        throw new Error(i18n.t("connect.exportService.nacos.getServiceList.error", {
            e: error
        }));
    }


    return Promise.resolve(array);
}


async function getServiceData(serviceName, registryConfig) {

    // `http://127.0.0.1:8848/api/dev/service/${org.apache.dubbo.demo.DemoService}`
    let url = `${registryConfig.address}/service/${serviceName}`

    let response = await axios.get(url, {
        headers: { 
            'Authorization': await getToken(registryConfig)
            }
    });

    return response.data;
}


async function getProviderList(serviceName, registryConfig) {
    try {
        const data = await getServiceData(serviceName, registryConfig);

        let array = new Array();
        for (let i = 0; i < data.providers.length; i++) {
            array.push(parseProvderInfo(data.providers[i]))
        }

        return array;
    } catch (error) {
        throw new Error(i18n.t("connect.exportService.nacos.getProviderList.error", {
            e: error
        }));
    }
}



function parseProvderInfo(data) {
    let urlData = urlUtils.parseURL(`dubbo://${data.address}/?${data.parameters}`);
    return new common.ProviderInfo({
        application: data.application,
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

function parseConsumerInfo(data) {
    let urlData = urlUtils.parseURL(`dubbo://${data.address}:8080/?${data.parameters}`);
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


// eslint-disable-next-line no-unused-vars
async function getCurrentConfiguration(registryConfig, providerInfo) {
    throw new Error("暂不支持");
}



// eslint-disable-next-line no-unused-vars
async function getConfiguration(registryConfig, providerInfo) {
    throw new Error("暂不支持");
}

// eslint-disable-next-line no-unused-vars
async function saveConfiguration(registryConfig, providerInfo, doc) {
    throw new Error("暂不支持");
}


export default {
    getServiceList,
    getProviderList,
    getConsumerList,
    getMetaData,
    getConfiguration,
    getCurrentConfiguration,
    saveConfiguration
}