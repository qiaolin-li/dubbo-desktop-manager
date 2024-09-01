

import axios                    from 'axios'
import constant                 from '@/main/common/Constant'
import pluginManager            from '@/main/plugin/PluginManager'


/**
 * npmjs 搜索所用的接口，效果比开放接口的好
 */
class FuzzySearcher {

    async search(keyword){
        const response = await axios.get(`https://www.npmjs.com/search/suggestions?q=${constant.APPLICATION_PLUGINS_NAME_PREFIX},${keyword}&time`+ new Date().getTime());
        return await response.data.map(item => this.handleResult(item));
    }

    handleResult(item) {
        const plugin = pluginManager.get(item.name);
        let installStatus = 'uninstalled';
        if (plugin) {
            installStatus = plugin.version === item.version ? 'installed' : 'update';
        }
        
        return {
            id: item.name,
            name: item.pluginName || item.name.replace(`${constant.APPLICATION_PLUGINS_NAME_PREFIX}`, ''),
            author: item.author.name,
            description: item.description,
            logo: `https://cdn.jsdelivr.net/npm/${item.name}/logo.png`,
            config: {},
            homepage: item.links ? item.links.homepage : 'https://www.npmjs.com/package/' + item.name,
            installVersion:plugin ? plugin.version : '',
            installStatus: installStatus,
            version: item.version,
        }
    }

}

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
        try {
            const response = await axios.get(`https://registry.npmjs.com/-/v1/search?text=${constant.APPLICATION_PLUGINS_NAME_PREFIX}${keyword}&time=${new Date().getTime()}`);
            return response.data.objects.filter(item => item.package.name.startsWith(constant.APPLICATION_PLUGINS_NAME_PREFIX)).map(item => this.handleResult(item));
        } catch(e){
            const response = await axios.get(`https://registry.npmmirror.com/-/v1/search?text=${constant.APPLICATION_PLUGINS_NAME_PREFIX}${keyword}&time=${new Date().getTime()}`);
            return response.data.objects.filter(item => item.package.name.startsWith(constant.APPLICATION_PLUGINS_NAME_PREFIX)).map(item => this.handleResult(item));
        }
    }

    handleResult(item) {
        const plugin = pluginManager.get(item.package.name);

        let installStatus = 'uninstalled';
        if (plugin) {
            installStatus = plugin.version === item.package.version ? 'installed' : 'update';
        }
        

        return {
            id: item.package.name,
            name: item.package.pluginName || item.package.name.replace(`${constant.APPLICATION_PLUGINS_NAME_PREFIX}`, ''),
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