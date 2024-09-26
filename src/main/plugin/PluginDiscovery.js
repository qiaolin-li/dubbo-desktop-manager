import remoteConfig             from "./RemoteConfig";
import windowHolder             from '@/main/common/holder/WindowHolder.js';
import pluginManager            from "@/main/plugin/PluginManager.js";
import logger                   from '@/main/common/logger';

class PluginDiscovery {
    constructor() {}


    async discover(module, type) {
        logger.info(`给用户推荐插件[${module}][${type}, 开始`);
        const config = await remoteConfig.getConfig();

        if(!config ||!config.discoveryPlugin || !config.discoveryPlugin[module] || !config.discoveryPlugin[module][type]) {
            return;
        }

        const pluginConfig = config.discoveryPlugin[module][type];
        if(!pluginConfig.plugins || !pluginConfig.plugins.length) {
            return;
        }

        const plugins = [];
        for (let i = 0; i < pluginConfig.plugins.length; i++) {
            const pluginName = pluginConfig.plugins[i];
            if(pluginManager.get(pluginName)) {
               return;
            }
            
            plugins.push(pluginName);
        }

        if(!plugins.length) {
            return;
        }
        
        // 通知渲染进程，弹起插件安装框
        windowHolder.send(`plugin-discovery`, {
            title: pluginConfig.title || '插件安装',
            plugins
        });

        logger.info(`给用户推荐插件[${module}][${type}, 结束`);
    }

}


export default new PluginDiscovery()