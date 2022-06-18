import zookeeperRegistry from "./zookeeper-registry";
import nacosRegistry from "./nacos-registry";
import connectRepository from "@/core/repository/connectRepository.js";


const map = new Map();

map.set("zookeeper", zookeeperRegistry);
map.set("nacos", nacosRegistry);


async function getServiceList(registryCenterId) {
    let registryConfig = await connectRepository.findById(registryCenterId);
    let registry = getRealRegistry(registryConfig);
    return registry.getServiceList(registryConfig);
}

async function getProviderList(serviceName, registryCenterId) {
    let registryConfig = await connectRepository.findById(registryCenterId);
    let registry = getRealRegistry(registryConfig);
    return registry.getProviderList(serviceName, registryConfig);
}

async function getConsumerList(serviceName,  registryCenterId) {
    let registryConfig = await connectRepository.findById(registryCenterId);
    let registry = getRealRegistry(registryConfig);
    return registry.getConsumerList(serviceName, registryConfig);
}

async function getMethodFillObject(providerInfo, registryCenterId, methodName) {
    let registryConfig = await connectRepository.findById(registryCenterId);
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