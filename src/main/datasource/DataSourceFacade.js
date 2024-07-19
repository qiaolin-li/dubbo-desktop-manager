import i18n                     from '@/main/common/i18n'
import appCore                  from '@/main/AppCore.js';
import windowHolder             from '@/main/common/holder/WindowHolder.js';
import yamlUtils                from '@/main/common/utils/yamlUtils';
import pluginManager            from "@/main/plugin/PluginManager.js";
import invokeHisotryRecord      from "@/main/repository/InvokeHistoryRepository.js";
import dataSourceRepository     from "@/main/repository/DataSourceRepository.js";

class DataSourceFacade {

    async getDataSourceList() {
        return Array.from(appCore.datasources.entries()).map(([key, value]) => ({
            type: key,
            label: value.title || key,
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
            throw new Error(i18n.t("connect.exportService.nacos.getServiceList.error", { e: error}));
        }
    }

    async getServiceList(registryCenterId) {
        try {
            let registryConfig = await this.getDataSourceInfo(registryCenterId);
            return await this.getRealRegistry(registryConfig).getServiceList(registryConfig);
        } catch (error) {
            throw new Error(i18n.t("connect.exportService.nacos.getServiceList.error", { e: error}));
        }
    }

    async getProviderList(serviceName, registryCenterId) {
        try {
            let registryConfig = await this.getDataSourceInfo(registryCenterId);
            return await this.getRealRegistry(registryConfig).getProviderList(serviceName, registryConfig);
        } catch (error) {
            throw new Error(i18n.t("connect.exportService.nacos.getProviderList.error", { e: error }));
        }
    }

    async getConsumerList(serviceName, registryCenterId) {
        try {
            let registryConfig = await this.getDataSourceInfo(registryCenterId);
            return await this.getRealRegistry(registryConfig).getConsumerList(serviceName, registryConfig);
        } catch (error) {
            throw new Error(i18n.t("connect.exportService.nacos.getConsumerList.error", {e: error}));
        }
    }

    async getConfiguration(providerInfo, registryCenterId) {
        let registryConfig = await this.getDataSourceInfo(registryCenterId);
        const config = await this.getRealRegistry(registryConfig).getConfiguration(registryConfig, providerInfo);

        // 不存在，生成默认的yam
        return config || yamlUtils.JSONToYaml(yamlUtils.createDubboDefaultConfiguration(this.provider.serviceName));
    }


    async saveConfiguration(registryCenterId, providerInfo, ymal) {
        try {
            const doc = yamlUtils.yamlToJSON(ymal);
            let registryConfig = await dataSourceRepository.findById(registryCenterId);
            return await this.getRealRegistry(registryConfig).saveConfiguration(registryConfig, providerInfo, doc);
        } catch (e) {
            throw new Error({ type: "error", message: this.$t('dubbo.configurationPage.invalidFormat')});
        }
    }

    async disableProvider(registryCenterId, providerInfo) {
        let registryConfig = await this.getDataSourceInfo(registryCenterId);
        let doc = await this.getRealRegistry(registryConfig).getCurrentConfiguration(registryConfig, providerInfo);

        doc = await this.addOrUpdateConfigration(doc, providerInfo.address);

        await this.getRealRegistry(registryConfig).saveConfiguration(registryConfig, providerInfo, doc);
    }

    async enableProvider(registryCenterId, providerInfo) {
        let registryConfig = await this.getDataSourceInfo(registryCenterId);

        let doc = await this.getRealRegistry(registryConfig).getCurrentConfiguration(registryConfig, providerInfo);

        doc = await this.deleteConfigration(doc, providerInfo.address);

        await this.getRealRegistry(registryConfig).saveConfiguration(registryConfig, providerInfo, doc);
    }



    async invokeMethod(registryCenterId, uniqueServiceName, providerInfo, methodInfo, code, invokerType) {
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


    addOrUpdateConfigration(doc, address) {
        let find = false;
        for (let i = 0; i < doc.configs.length; i++) {
            let config = doc.configs[i];
            let { side, addresses } = config;

            if (side != "provider") continue;

            if (addresses && addresses.length == 1 && addresses[0] == address) {
                config.enabled = true;
                if (!config.parameters)  config.parameters = [];

                config.parameters.disabled = true;
                find = true;
                break;
            }
        }

        if (!find) {
            doc.configs.push({
                addresses: [ address ],
                enabled: true,
                parameters: {
                    disabled: true
                },
                side: "provider"
            });
        }

        return doc;
    }



    deleteConfigration(doc, address) {
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

  
    async getDataSourceInfo(registryCenterId) {
        return await dataSourceRepository.findById(registryCenterId);
    }
}



export default new DataSourceFacade();