import appCore              from '@/main/AppCore.js';
import windowHolder         from '@/main/common/holder/WindowHolder.js';
import configuration        from '@/main/common/utils/Configuration';
import connectRepository    from "@/main/repository/connectRepository.js";
import invokeHisotryRecord  from "@/main/repository/invokeHistoryRepository.js";
import pluginManager        from "@/main/plugin/PluginManager.js";


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

async function getConsumerList(serviceName, registryCenterId) {
    let registryConfig = await connectRepository.findById(registryCenterId);
    let registry = getRealRegistry(registryConfig);
    return registry.getConsumerList(serviceName, registryConfig);
}


async function getConfiguration(providerInfo, registryCenterId) {
    let registryConfig = await connectRepository.findById(registryCenterId);
    
    let registry = getRealRegistry(registryConfig);

    const config = registry.getConfiguration(registryConfig, providerInfo);
    if(config){
        return config;
    }

    // 不存在，生成默认的yam
    return configuration.JSONToYaml(configuration.createDefaultConfiguration(this.provider.serviceName));
}


async function saveConfiguration(registryCenterId, providerInfo, ymal) {
    let doc = null;
      try {
        doc = configuration.yamlToJSON(ymal);
      } catch (e) {
        this.$message({
            type: "error",
            message: this.$t('dubbo.configurationPage.invalidFormat'),
        });
        return;
    }


    let registryConfig = await connectRepository.findById(registryCenterId);
    
    let registry = getRealRegistry(registryConfig);

    return registry.saveConfiguration(registryConfig, providerInfo, doc);
}

async function disableProvider(registryCenterId, providerInfo) {
    let registryConfig = await connectRepository.findById(registryCenterId);
    let registry = getRealRegistry(registryConfig);

    let doc = await registry.getCurrentConfiguration(registryConfig, providerInfo);

    doc = await addOrUpdateConfigration(doc, providerInfo.address);

    await registry.saveConfiguration(registryConfig, providerInfo, doc);

}

async function enableProvider(registryCenterId, providerInfo) {
    let registryConfig = await connectRepository.findById(registryCenterId);
    let registry = getRealRegistry(registryConfig);

    let doc = await registry.getCurrentConfiguration(registryConfig, providerInfo);

    doc = await deleteConfigration(doc, providerInfo.address);

    await registry.saveConfiguration(registryConfig, providerInfo, doc);
}





function getRealRegistry(registryConfig) {
    // 默认zk
    let type = registryConfig.type || "zookeeper";
    let registry = appCore.getDataSource(type);

    if (!registry) {
        return Promise.reject(new Error(`注册中心类型不支持 [${registryConfig.type}]`))
    }
    return registry;
}


function addOrUpdateConfigration(doc, address) {
    let find = false;
    for (let i = 0; i < doc.configs.length; i++) {
        let config = doc.configs[i];
        let {
            side,
            addresses
        } = config;

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
            if (addresses[i] === address) {
                addresses.splice(i, 1);
            }
        }

        if (addresses.length == 0) {
            doc.configs.splice(i, 1);
        }

    }

    if (doc.configs.length == 0) {
        return {};
    }

    return doc;
}


async function invokeMethod(registryCenterId, uniqueServiceName, providerInfo, methodInfo, code, invokerType) {
    let registryConfig = await connectRepository.findById(registryCenterId);
    let registry = getRealRegistry(registryConfig);

    let result = await registry.invokeMethod(registryConfig, providerInfo,  methodInfo, code, invokerType);
    pluginManager.getList().forEach(async (plugin) => {
        if (plugin.afterInvoke) {
            result = await plugin.afterInvoke(result);
        }
    });

    const interfaceName =  registryConfig.type === 'dubbo-admin' ? providerInfo.serviceName.split(":")[0] : providerInfo.serviceName;

    // 保存调用记录
    let invokeHistory = {
        registryCenterId,
        serviceName: interfaceName,
        uniqueServiceName,
        address: providerInfo.address,
        method: methodInfo.name,
        param: code,
        result: JSON.stringify(result.data),
    };
    await invokeHisotryRecord.save(invokeHistory);
    windowHolder.getWindow().webContents.send(`newInvokeHisotryRecordEvent-${registryCenterId}`);

    return result;
}
  

let data = {
    getServiceList,
    getProviderList,
    getConsumerList,
    getConfiguration,
    saveConfiguration,
    disableProvider,
    enableProvider,
    invokeMethod
}

export default data;