import zkClientUtils from "./zkClientUtils";
import zookeeperClient from "node-zookeeper-client";
import yaml from "js-yaml";


async function disableProvider(serviceName, registryConfig, address, version) {
    let zkClient = await zkClientUtils.createConncetion(registryConfig);

    let doc = await getCurrentConfiguration(zkClient, serviceName, version);

    doc = await addOrUpdateConfigration(doc, address);

    await saveConfiguration(zkClient, serviceName, version, doc);
}


async function enableProvider(serviceName, registryConfig, address, version) {
    let zkClient = await zkClientUtils.createConncetion(registryConfig);

    let doc = await getCurrentConfiguration(zkClient, serviceName, version);
    doc = await deleteConfigration(doc, address);
    
    await saveConfiguration(zkClient, serviceName, version, doc);
}


/**
 * 
 * @param {string} serviceName 
 * @param {string[]} versions 多个版本
 */
async function getDisableInfo(registryConfig, serviceName, versions){
    let zkClient = await zkClientUtils.createConncetion(registryConfig);

    let result = {};

    for (let i = 0; i < versions.length; i++) {
        const version = versions[i];
        let doc = await getCurrentConfiguration(zkClient, serviceName, version);
        let currentVersionDisableAddress = [];
        if(doc && doc.configs){
            let configs = doc.configs;
            for(let j = 0; j < configs.length; j++){
                let config = configs[j];
                // 规则不是开启的，忽略
                if(!config.enabled) {
                    continue;
                }

                if(!config.parameters || !config.parameters.disabled || config.parameters.disabled != true){
                    continue;
                }

                currentVersionDisableAddress = currentVersionDisableAddress.concat(config.addresses);
            }
        }

        result[version] = currentVersionDisableAddress;
    }
    return result;
}


function getCurrentConfiguration(zkClient, serviceName, version) {
    let path = getPath(serviceName, version);
    return new Promise((resolve, reject) => {
        zkClient.getData(path, async function (error, data, stat) {
            if (error && error.code != -101) {
                reject(error);
                return;
            }

            if (error && error.code == -101) {
                resolve(createDefaultConfiguration(serviceName));
                return;
            }
            let doc = yaml.load(data.toString("utf8"));
            if (doc) {
                resolve(doc);
                return;
            }
            resolve(createDefaultConfiguration(serviceName));

        });
    });


}

function createDefaultConfiguration(serviceName) {
    let doc = {
        configVersion: "v2.7",
        key: serviceName,
        scope: "service",
        enabled: true,
        configs: []
    }
    return doc;
}

function addOrUpdateConfigration(doc, address) {
    let find = false;
    for (let i = 0; i < doc.configs.length; i++) {
        let config = doc.configs[i];
        let { side, addresses } = config;

        if (side != "provider") {
            continue;
        }

        if (addresses && addresses.length == 1 && addresses[0] == address) {
            config.enabled = true;
            if (!config.parameters) {
                config.parameters = [];
            }

            config.parameters.disabled = true;
            find = true;
            break;
        }
    }

    if (!find) {
        doc.configs.push({
            addresses: [
                address
            ],
            enabled: true,
            parameters: {
                disabled: true
            },
            side: "provider"
        });
    }

    return doc;
}


function deleteConfigration(doc, address) {
    for (let i = 0; i < doc.configs.length; i++) {
        let config = doc.configs[i];
        let {
            side,
            addresses
        } = config;

        if (side != "provider") {
            continue;
        }

        // 不是禁用的规则，忽略
        if (!config.parameters || !config.parameters.disabled) {
            continue;
        }

        for (let i = 0; i < addresses.length; i++) {
            if (addresses[i] === address ) {
                addresses.splice(i, 1);
            }
        }

        if (addresses.length == 0) {
            doc.configs.splice(i, 1);
        }

    }

    if(doc.configs.length == 0){
        return {};
    }    

    return doc;
}

function saveConfiguration(zkClient, serviceName, version, doc) {
    let path = getPath(serviceName, version);
    let str = yaml.dump(doc);

    if(doc && doc.configs && doc.configs.length > 0){
        zkClient.setData(path, Buffer.from(str), -1, function (error, stat) {
            if (error && error.code == -101) {
                zkClient.create(path, Buffer.from(str), zookeeperClient.CreateMode.PERSISTENT, function (error, stat) {
                    if (error) {
                        console.log(error.stack);
                        return;
                    }
                });
                return;
            }
            console.log(error);
        });

        return ;
    } 

    zkClient.remove(path, -1, function (error) {
        if (error) {
            console.log(error);
            throw new Error();
        }
    
    });
}

function getPath(serviceName, version) {
    return `/dubbo/config/dubbo/${serviceName}:${version ? version : ""}:.configurators`;
}


export default {
    disableProvider,
    enableProvider,
    getDisableInfo,
    
}