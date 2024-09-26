

import axios                    from 'axios'
import pluginManagerClient      from '@/renderer/api/PluginManagerClient.js'
import FuzzySearcher           from '@/renderer/api/plugin/FuzzySearcher.js'    

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
                        .filter(item => item.package.name.startsWith(window.constant.APPLICATION_PLUGINS_NAME_PREFIX))
                        .map(item => this.handleResult(item, installedPluginInfoList));
        } catch(e){
            const response = await axios.get(`https://registry.npmmirror.com/-/v1/search?text=${window.constant.APPLICATION_PLUGINS_NAME_PREFIX}${keyword}&time=${new Date().getTime()}`);
            return response.data.objects
                        .filter(item => item.package.name.startsWith(window.constant.APPLICATION_PLUGINS_NAME_PREFIX))
                        .map(item => this.handleResult(item, installedPluginInfoList));
        }
    }


    async getList(pluginNames = []){
        const installedPluginInfoList = await pluginManagerClient.getInstalledPluginInfoList();

        const pluginList = [];
        for (let i = 0; i < pluginNames.length; i++) {
            const pluginName = pluginNames[i];

            // 插件已经安装，不进行操作
            const plugin = installedPluginInfoList.find(plugin => plugin.name === pluginName);
            if(plugin) {
                continue;
            }

            const pluginInfo = await this.#get(pluginName);

            if(pluginInfo) {
                pluginInfo.logoLoadSuccess = true;
                pluginInfo.ing = false;
                pluginList.push(pluginInfo);
            }
        }
        
        return pluginList;
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
                author: lastestVersionInfo.author.name,
                description: lastestVersionInfo.description,
                logo: `https://cdn.jsdelivr.net/npm/${lastestVersionInfo.name}/logo.png`,
                config: {},
                homepage: lastestVersionInfo.links ? lastestVersionInfo.links.homepage : 'https://www.npmjs.com/package/' + lastestVersionInfo.name,
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
        const plugin = installedPluginInfoList.find(plugin => plugin.name === item.name);

        let installStatus = 'uninstalled';
        if (plugin) {
            installStatus = plugin.version === item.package.version ? 'installed' : 'update';
        }
        

        return {
            id: item.package.name,
            name: item.package.pluginName || item.package.name.replace(`${window.constant.APPLICATION_PLUGINS_NAME_PREFIX}`, ''),
            author: item.package.author.name,
            description: item.package.description,
            logo: `https://cdn.jsdelivr.net/npm/${item.package.name}/logo.png`,
            config: {},
            homepage: item.package.links ? item.package.links.homepage : 'https://www.npmjs.com/package/' + item.package.name,
            installVersion:plugin ? plugin.version : '',
            installStatus: installStatus,
            version: item.package.version,
        }
    }

}
export default new PluginSearcher();