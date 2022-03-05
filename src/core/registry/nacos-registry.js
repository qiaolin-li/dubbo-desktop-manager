import common from "./common";
const axios = require('axios').default;
import resolveMateData from "./resolveMateData";

async function getServiceList(registryConfig) {

    let params = {
        pageNo: 1,
        pageSize: 1,
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

            array.push(new common.ServiceInfo(datas[1], serviceName));
        }

        count = data.doms.length;
        params.pageNo++;
    } while (count == params.pageSize);

    return Promise.resolve(array);
}


function doGetServiceList(url, params) {

    return new Promise((resolve, reject) => {
        axios.get(url, {
                params
            }).then(function (response) {
                if (response.status != 200) {
                    reject(new Error("查询服务列表错误! 原因" + response.data))
                    return;
                }

                return resolve(response.data);
            })
            .catch(function (error) {
                reject(new Error("查询服务列表错误! 原因" + error))
            })

    });

}

function getProviderList(serviceInfo, registryConfig) {

    // http://127.0.0.1:8848/nacos/v1/ns/instance/list
    let url = `${registryConfig.address}/nacos/v1/ns/instance/list`;

    let params = {
        serviceName: serviceInfo.serviceName,
        namespaceId: registryConfig.namespaceId || ""
    }

    return new Promise((resolve, reject) => {
        axios.get(url, {
                params
            }).then(function (response) {
                if (response.status != 200) {
                    reject(new Error("查询服务列表错误! 原因" + response.data))
                    return;
                }

                if (!response.data || !response.data.hosts) {
                    return resolve(new Array());
                }

                let array = new Array();
                for (let i = 0; i < response.data.hosts.length; i++) {
                    const host = response.data.hosts[i];
                    array.push(parseProvderInfo(host))
                }

                return resolve(array);
            })
            .catch(function (error) {
                reject(new Error("查询服务列表错误! 原因" + error))
            })

    });
}



function parseProvderInfo(data) {
    let metadata = data.metadata || [];

    return new common.ProviderInfo({
        application: metadata.application,
        ip: data.ip,
        port: data.port,
        serviceName: metadata.interface,
        methods: metadata.methods.split(","),
        generic: metadata.generic,
        version: metadata.version,
        revision: metadata.revision,
        dubboVersion: metadata.dubbo,
        deprecated: metadata.deprecated,
        weight: data.weight,
        enabled: data.enabled
    });
}


function getConsumerList(serviceInfo, registryConfig) {

    // http://127.0.0.1:8848/nacos/v1/ns/instance/list
    let url = `${registryConfig.address}/nacos/v1/ns/instance/list`;

    let params = {
        serviceName: serviceInfo.serviceName,
        namespaceId: registryConfig.namespaceId || ""
    }

    return new Promise((resolve, reject) => {
        axios.get(url, {
                params
            }).then(function (response) {
                if (response.status != 200) {
                    reject(new Error("查询服务列表错误! 原因" + response.data))
                    return;
                }

                if (!response.data || !response.data.hosts) {
                    return resolve(new Array());
                }

                let array = new Array();
                for (let i = 0; i < response.data.hosts.length; i++) {
                    const host = response.data.hosts[i];
                    array.push(parseProvderInfo(host))
                }

                return resolve(array);
            })
            .catch(function (error) {
                reject(new Error("查询服务列表错误! 原因" + error))
            })

    });
}

function getMethodFillObject(providerInfo, registryConfig, methodName) {

    // http://127.0.0.1:8848/nacos/v1/cs/configs
    let url = `${registryConfig.address}/nacos/v1/cs/configs`;

    let {
        application,
        serviceName,
        version
    } = providerInfo;
    version = version || "";
    let dataId = `${serviceName}:${version}::provider:${application}`;

    let params = {
        dataId: dataId,
        group: "dubbo",
        tenant: registryConfig.namespaceId || ""
    }

    return new Promise((resolve, reject) => {
        axios.get(url, {
                params
            }).then(function (response) {

                if (response.status == 404) {
                    reject(new Error("未找到元数据信息"));
                    return;
                }

                if (response.status != 200) {
                    reject(new Error("查询元数据错误! 原因" + response.data))
                    return;
                }

                if (!response.data) {
                    return resolve("[]");
                }

                resolve(resolveMateData.generateParam(response.data, methodName));
            })
            .catch(function (error) {
                reject(new Error("查询服务列表错误! 原因" + error))
            })

    });
}

export default {
    getServiceList,
    getProviderList,
    getConsumerList,
    getMethodFillObject
}