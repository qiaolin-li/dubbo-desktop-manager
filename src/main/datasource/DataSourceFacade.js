import i18n                     from '@/main/common/i18n'
import appCore                  from '@/main/AppCore.js';
import windowHolder             from '@/main/common/holder/WindowHolder.js';
import pluginManager            from "@/main/plugin/PluginManager.js";
import invokeHisotryRecord      from "@/main/repository/InvokeHistoryRepository.js";

class DataSourceFacade {

    constructor() {
         return new Proxy(this, {
            get(target, prop) {
                // 检查方法是否存在
                if (typeof target[prop] === 'function') {
                    return target[prop].bind(target); 
                } else {
                    return function () {
                        return target.otherMethod(prop, [...arguments])
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
            console.log(error);
            throw new Error(i18n.t("connect.getFromDataError", { e: error}));
        }
    }

    async getServiceList(dataSourceInfo) {
        try {
            return await this.getRealRegistry(dataSourceInfo).getServiceList(dataSourceInfo);
        } catch (error) {
            console.log(error);
            throw new Error(i18n.t("connect.getServiceListError", { e: error}));
        }
    }

    async getProviderList(dataSourceInfo, serviceInfo) {
        try {
            return await this.getRealRegistry(dataSourceInfo).getProviderList(dataSourceInfo, serviceInfo);
        } catch (error) {
            console.log(error);
            throw new Error(i18n.t("connect.getProviderListError", { e: error }));
        }
    }

    async getConsumerList(dataSourceInfo, serviceInfo) {
        try {
            return await this.getRealRegistry(dataSourceInfo).getConsumerList(dataSourceInfo, serviceInfo);
        } catch (error) {
            console.log(error);
            throw new Error(i18n.t("connect.getConsumerListError", {e: error}));
        }
    }

    async disableProvider(dataSourceInfo, serviceInfo, providerInfo) {
        try {
            await this.getRealRegistry(dataSourceInfo).disableProvider(dataSourceInfo, serviceInfo, providerInfo);
        } catch (error) {
            console.log(error);
            throw new Error(i18n.t("connect.disableProviderError", {e: error}));
        }
    }

    async enableProvider(dataSourceInfo, serviceInfo, providerInfo) {
        try {
            return await this.getRealRegistry(dataSourceInfo).enableProvider(dataSourceInfo, serviceInfo, providerInfo);
        } catch (error) {
            console.log(error);
            throw new Error(i18n.t("connect.enableProviderError", {e: error}));
        }
    }

    async invokeMethod(dataSourceInfo, serviceInfo, providerInfo, methodInfo, code, invokerType) {
        try {
            let result = await this.getRealRegistry(dataSourceInfo).invokeMethod(dataSourceInfo, serviceInfo, providerInfo,  methodInfo, code, invokerType);
            pluginManager.getList().forEach(async (plugin) => {
                if (plugin.afterInvoke) {
                    result = await plugin.afterInvoke(result);
                }
            });

            // 保存调用记录
            let invokeHistory = {
                registryCenterId: dataSourceInfo._id,
                serviceName: providerInfo.serviceName,
                uniqueServiceName: providerInfo.uniqueServiceName,
                address: providerInfo.address,
                method: methodInfo.name,
                param: code,
                result: JSON.stringify(result.data),
            };
            await invokeHisotryRecord.save(invokeHistory);
            windowHolder.getWindow().webContents.send(`newInvokeHisotryRecordEvent-${dataSourceInfo._id}`);

            return result;
        } catch (error) {
            console.log(error);
            throw new Error(i18n.t("connect.invokeMethodError", {e: error}));
        }
    }


    async otherMethod(methodName, args) {
        try {
            const dataSourceInfo = args[0];
            const registry = this.getRealRegistry(dataSourceInfo);

            if (!registry[methodName]) {
                const registry = appCore.getDataSource(dataSourceInfo.type);
                throw new Error(`注册中心 [${registry.name || registry.key}]不支持[${methodName}]方法`);
            }
        
            return await Reflect.apply(registry[methodName], registry, args);
        } catch (error) {
            console.log(error);
            throw new Error(i18n.t("connect.invokeMethodError", {e: error}));
        }
    }


    getRealRegistry(dataSourceInfo) {
        let registry = appCore.getDataSource(dataSourceInfo.type);

        if (!registry) {
            throw new Error(`注册中心类型不支持 [${dataSourceInfo.type}]`);
        }
        return registry;
    }

}

export default new DataSourceFacade();