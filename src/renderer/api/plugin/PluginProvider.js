

import axios                    from 'axios'
import pluginManagerClient      from '@/renderer/api/PluginManagerClient.js'
import FuzzySearcher            from '@/renderer/api/plugin/FuzzySearcher.js'    
import pluginConfig             from '@/renderer/api/plugin/PluginConfig.js'   

/**
 * npmjs 开放的包查询接口，但是不支持摸索搜索
 */
class PluginSearcher {

    constructor() {
        this.fuzzySearch = new FuzzySearcher();
    }

    async search(keyword){
        if(keyword){
            return await this.fuzzySearch.search(keyword);
        }

        const installedPluginInfoList = await pluginManagerClient.getInstalledPluginInfoList();
        try {
            const response = await axios.get(`https://registry.npmjs.com/-/v1/search?text=${window.constant.APPLICATION_PLUGINS_NAME_PREFIX}${keyword}&time=${new Date().getTime()}`);
            return response.data.objects
                        .filter(item => item.package.name.startsWith(window.constant.APPLICATION_PLUGINS_NAME_PREFIX) && pluginConfig.isNotBlackListPlugin(item.package.name))
                        .map(item => this.handleResult(item, installedPluginInfoList));
        } catch(e){
            const response = await axios.get(`https://registry.npmmirror.com/-/v1/search?text=${window.constant.APPLICATION_PLUGINS_NAME_PREFIX}${keyword}&time=${new Date().getTime()}`);
            return response.data.objects
                        .filter(item => item.package.name.startsWith(window.constant.APPLICATION_PLUGINS_NAME_PREFIX) && pluginConfig.isNotBlackListPlugin(item.package.name))
                        .map(item => this.handleResult(item, installedPluginInfoList));
        }
    }


    async #get(name){
        try {
            const response = await axios.get(`https://registry.npmjs.com/${name}`);
            if(!response.data){
                return null;
            }
    
            const data = response.data;
            const latest = data["dist-tags"].latest;
            
            const lastestVersionInfo = data.versions[latest];

            return {
                id: lastestVersionInfo.name,
                name: lastestVersionInfo.pluginName || lastestVersionInfo.name.replace(`${window.constant.APPLICATION_PLUGINS_NAME_PREFIX}`, ''),
                author: lastestVersionInfo?.author?.name ?? '',
                description: lastestVersionInfo.description,
                logo: `https://cdn.jsdelivr.net/npm/${lastestVersionInfo.name}/logo.png`,
                config: {},
                homepage: lastestVersionInfo?.links?.homepage ?? 'https://www.npmjs.com/package/' + lastestVersionInfo.name,
                installVersion: '',
                installStatus: 'uninstalled',
                version: lastestVersionInfo.version,
            }
        } catch(e){
            console.error(`获取单个插件失败, name:${name}`);
            throw e;
        }
    }

    handleResult(item, installedPluginInfoList) {
        const packageInfo = item.package;
        const name = packageInfo.name;

        const plugin = installedPluginInfoList.find(plugin => plugin.name === name);

        let installStatus = 'uninstalled';
        if (plugin) {
            installStatus = plugin.version === item.package.version ? 'installed' : 'update';
        }
        

        return {
            id: name,
            name: packageInfo.pluginName || name.replace(`${window.constant.APPLICATION_PLUGINS_NAME_PREFIX}`, ''),
            author: packageInfo?.author?.name ?? '',
            description: packageInfo.description,
            logo: `https://cdn.jsdelivr.net/npm/${name}/logo.png`,
            config: {},
            homepage: packageInfo?.links?.homepage ?? 'https://www.npmjs.com/package/' + name,
            installVersion: plugin?.version ?? '',
            installStatus: installStatus,
            version: packageInfo.version,
        }
    }


    /**
     * 根据模块 + 类型 获取推荐列表， 例如：数据源 + 数据源类型、i18n + 地区代码
     * @param {*} module 模块
     * @param {*} type 类型
     * @returns 
     */
    async getRecommendPluginList(module, type) {
        const recommendPluginInfo = pluginConfig.discoveryPlugin(module, type);
        if (!recommendPluginInfo?.plugins?.length) {
            return;
        }

        const installedPluginInfoList = await pluginManagerClient.getInstalledPluginInfoList();

        const plugins = [];
        for (let i = 0; i < recommendPluginInfo.plugins.length; i++) {
            const pluginName = recommendPluginInfo.plugins[i];
            
            if(installedPluginInfoList.find(plugin => plugin.name === pluginName) ) {
               return;
            }

            const pluginInfo = await this.#get(pluginName);
            plugins.push(pluginInfo);
        }

        return {
            ...recommendPluginInfo,
            plugins
        };
    }
}
export default new PluginSearcher();