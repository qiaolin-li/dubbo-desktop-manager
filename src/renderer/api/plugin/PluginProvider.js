

import axios                    from 'axios'
import pluginManagerClient      from '@/renderer/api/PluginManagerClient.js'
import FuzzySearcher            from '@/renderer/api/plugin/FuzzySearcher.js'    
import pluginConfig             from '@/renderer/api/plugin/PluginConfig.js'   
import appConfig                from "@/renderer/api/AppConfigClient.js";
import appRendener              from '@/renderer/core/AppRendener';
import { Notification }         from 'element-ui';
import { ipcRenderer }          from 'electron'
import pluginDiscovery from '@/renderer/views/plugin/pluginDiscovery.vue';

/**
 * npmjs 开放的包查询接口，但是不支持摸索搜索
 */
class PluginSearcher {

    constructor() {
        this.fuzzySearch = new FuzzySearcher();
        ipcRenderer.on('plugin-discovery', async (sender, {module, type}) => this.getRecommendPluginList(module, type));
    }

    async search(keyword){
        if(keyword){
            return await this.fuzzySearch.search(keyword);
        }

        const installedPluginInfoList = await pluginManagerClient.getInstalledPluginInfoList();
        const npmRegistry = await appConfig.getProperty("npmRegistry") || "https://registry.npmjs.com/";

        try {
            // 暂时应该不会超过100个插件，问题不大
            const url = new URL(`/-/v1/search?text=${window.constant.APPLICATION_PLUGINS_NAME_PREFIX}${keyword}&size=100&time=${new Date().getTime()}`, npmRegistry).href;
            const response = await axios.get(url);
            return response.data.objects
                        .filter(item => item.package.name.startsWith(window.constant.APPLICATION_PLUGINS_NAME_PREFIX) && pluginConfig.isNotBlackListPlugin(item.package.name))
                        .map(item => this.handleResult(item, installedPluginInfoList));
        } catch(e){
            throw new Error("获取插件列表失败, 请检查网络或者设置npmRegistry镜像");
        }
    }


    async #get(name){
        const npmRegistry = await appConfig.getProperty("npmRegistry") || "https://registry.npmjs.com/";

        try {
            const response = await axios.get(new URL(name, npmRegistry).href);
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
                star: pluginConfig.isRecommendPlugin(lastestVersionInfo.name),    // 是否为推荐的优秀插件，
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
            homepage: packageInfo?.links?.homepage ?? 'https://www.npmjs.com/package/' + name,
            installVersion: plugin?.version ?? '',
            installStatus: installStatus,
            version: packageInfo.version,
            star: pluginConfig.isRecommendPlugin(name),    // 是否为推荐的优秀插件，
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

        const pluginList = [];
        for (let i = 0; i < recommendPluginInfo.plugins.length; i++) {
            const pluginName = recommendPluginInfo.plugins[i];
            
            if(installedPluginInfoList.find(plugin => plugin.name === pluginName) ) {
               return;
            }

            const pluginInfo = await this.#get(pluginName);
            pluginInfo.logoLoadSuccess = true;
            pluginInfo.ing = false;
            pluginList.push(pluginInfo);
        }

        if(!pluginList.length) {
            return;
        }

        Notification.info({
            title: '推荐插件安装提示',
            message: `${recommendPluginInfo.title}, 点击当前消息进行安装`,
            position: 'bottom-right',
            onClick: async () => {
                appRendener.openDialog({
                    component: pluginDiscovery,
                    title: "推荐插件安装",
                    width: "90%",
                    top: "5vh",
                    params: {
                        pluginList
                    }
                });
            }
        });
     
    }
}
export default new PluginSearcher();