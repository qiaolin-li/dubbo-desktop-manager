import zookeeperRegistry from "./zookeeper-registry";
import nacosRegistry from "./nacos-registry";


const map = new Map();

map.set("zookeeper", zookeeperRegistry);
map.set("nacos", nacosRegistry);


function getServiceList(registryConfig = {}) {
    let registry = getRealRegistry(registryConfig);
    return registry.getServiceList(registryConfig);
}

function getProviderList(serviceInfo, registryConfig = {}) {
    let registry = getRealRegistry(registryConfig);
    return registry.getProviderList(serviceInfo, registryConfig);
}

function getConsumerList(serviceInfo,  registryConfig = {}) {
    let registry = getRealRegistry(registryConfig);
    return registry.getConsumerList(serviceInfo, registryConfig);
}

function getMethodFillObject(providerInfo, registryConfig, methodName) {
    let registry = getRealRegistry(registryConfig);
    return registry.getMethodFillObject(providerInfo, registryConfig, methodName);
}

function getRealRegistry(registryConfig) {
    // 默认zk
    let type = registryConfig.type || "zookeeper";
    let registry = map.get(type);

    if (!registry) {
        return Promise.reject(new Error(`注册中心类型不支持 [${registryConfig.type}]`))
    }
    return registry;
}

export default {
    getServiceList,
    getProviderList,
    getConsumerList,
    getMethodFillObject
}