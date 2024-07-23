import i18n                     from '@/main/common/i18n'
import appCore                  from '@/main/AppCore.js';
import windowHolder             from '@/main/common/holder/WindowHolder.js';
import pluginManager            from "@/main/plugin/PluginManager.js";
import invokeHisotryRecord      from "@/main/repository/InvokeHistoryRepository.js";
import dataSourceRepository     from "@/main/repository/DataSourceRepository.js";

class DataSourceFacade {

    constructor() {
         return new Proxy(this, {
            get(target, prop) {
                // 检查方法是否存在
                if (typeof target[prop] === 'function') {
                    return target[prop].bind(target); // 返回绑定的函数
                } else {
                    return function() {
                        target.handleError(prop); // 调用通用方法
                    };
                }
            }
        });
    }

    async getDataSourceList() {
        return Array.from(appCore.datasources.entries()).map(([key, value]) => ({
            type: key,
            label: value.name || key,
        }));
    }

    async getFormConfig(dataSourceType){
        try {
            let registry = appCore.getDataSource(dataSourceType);

            if (!registry) {
                throw new Error(`注册中心类型不支持 [${dataSourceType}]`);
            }

            return await registry.getFormConfig();
        } catch (error) {
            throw new Error(i18n.t("connect.getFromDataError", { e: error}));
        }
    }

    async getServiceList(registryCenterId) {
        try {
            let registryConfig = await this.getDataSourceInfo(registryCenterId);
            return await this.getRealRegistry(registryConfig).getServiceList(registryConfig);
        } catch (error) {
            throw new Error(i18n.t("connect.getServiceListError", { e: error}));
        }
    }

    async getProviderList(serviceName, registryCenterId) {
        try {
            let registryConfig = await this.getDataSourceInfo(registryCenterId);
            return await this.getRealRegistry(registryConfig).getProviderList(serviceName, registryConfig);
        } catch (error) {
            throw new Error(i18n.t("connect.getProviderListError", { e: error }));
        }
    }

    async getConsumerList(serviceName, registryCenterId) {
        try {
            let registryConfig = await this.getDataSourceInfo(registryCenterId);
            return await this.getRealRegistry(registryConfig).getConsumerList(serviceName, registryConfig);
        } catch (error) {
            throw new Error(i18n.t("connect.getConsumerListError", {e: error}));
        }
    }

    async disableProvider(registryCenterId, providerInfo) {
        try {
            let registryConfig = await this.getDataSourceInfo(registryCenterId);

            await this.getRealRegistry(registryConfig).disableProvider(registryConfig, providerInfo, providerInfo);
        } catch (error) {
            throw new Error(i18n.t("connect.disableProviderError", {e: error}));
        }
    }

    async enableProvider(registryCenterId, providerInfo) {
        try {
            let registryConfig = await this.getDataSourceInfo(registryCenterId);
            return await this.getRealRegistry(registryConfig).enableProvider(registryConfig, providerInfo, providerInfo);
        } catch (error) {
            throw new Error(i18n.t("connect.enableProviderError", {e: error}));
        }
    }

    async invokeMethod(registryCenterId, uniqueServiceName, providerInfo, methodInfo, code, invokerType) {
        try {
            let registryConfig = await this.getDataSourceInfo(registryCenterId);

            let result = await this.getRealRegistry(registryConfig).invokeMethod(registryConfig, providerInfo,  methodInfo, code, invokerType);
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
        } catch (error) {
            throw new Error(i18n.t("connect.invokeMethodError", {e: error}));
        }
    }


    async otherMethod(methodName, registryCenterId, data) {
        try {
            let registryConfig = await this.getDataSourceInfo(registryCenterId);
            const method = this.getRealRegistry(registryConfig)['methodName'];
            if (!method) {
                const registry = appCore.getDataSource(registryConfig.type);
                throw new Error(`注册中心 [${registry.name || registry.key}]不支持[${methodName}]方法`);
            }
        
            return await method(registryConfig, data);
        } catch (error) {
            throw new Error(i18n.t("connect.invokeMethodError", {e: error}));
        }
    }


    getRealRegistry(registryConfig) {
        // 默认zk
        let type = registryConfig.type || "zookeeper";
        let registry = appCore.getDataSource(type);

        if (!registry) {
            throw new Error(`注册中心类型不支持 [${registryConfig.type}]`);
        }
        return registry;
    }

  
    async getDataSourceInfo(registryCenterId) {
        return await dataSourceRepository.findById(registryCenterId);
    }
}



export default new DataSourceFacade();