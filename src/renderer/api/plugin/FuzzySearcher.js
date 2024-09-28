
import axios                    from 'axios'
import pluginManagerClient      from '@/renderer/api/PluginManagerClient.js'
import pluginConfig             from '@/renderer/api/plugin/PluginConfig.js'   

/**
 * npmjs 搜索所用的接口，效果比开放接口的好
 */
class FuzzySearcher {

    async search(keyword){
        const response = await axios.get(`https://www.npmjs.com/search/suggestions?q=${window.constant.APPLICATION_PLUGINS_NAME_PREFIX},${keyword}&time`+ new Date().getTime());
        
        const installedPluginInfoList = await pluginManagerClient.getInstalledPluginInfoList();
        return await response.data
                    .filter(item => item.name.startsWith(window.constant.APPLICATION_PLUGINS_NAME_PREFIX) && pluginConfig.isNotBlackListPlugin(item.name))
                    .map(item => this.handleResult(item, installedPluginInfoList));
    }

    handleResult(item, installedPluginInfoList) {
        const plugin = installedPluginInfoList.find(plugin => plugin.name === item.name);
        let installStatus = 'uninstalled';
        if (plugin) {
            installStatus = plugin.version === item.version ? 'installed' : 'update';
        }
        
        return {
            id: item.name,
            name: item.pluginName || item.name.replace(`${window.constant.APPLICATION_PLUGINS_NAME_PREFIX}`, ''),
            author: item?.author?.name ?? '',
            description: item.description,
            logo: `https://cdn.jsdelivr.net/npm/${item.name}/logo.png`,
            homepage: item?.links?.homepage ?? 'https://www.npmjs.com/package/' + item.name,
            installVersion: plugin.version ?? '',
            installStatus: installStatus,
            version: item.version,
        }
    }

}


export default FuzzySearcher;