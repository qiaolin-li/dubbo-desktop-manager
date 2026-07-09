import pluginManagerClient              from '@/renderer/api/PluginManagerClient.js';
import pluginConfig                     from '@/renderer/api/plugin/config/PluginConfig.js';
import pluginRegistryGateway            from '@/renderer/api/plugin/registry/PluginRegistryGateway.js';
import { appIpc }                       from '@/renderer/core/AppRenderer';
import dialogHelper                     from '@/renderer/components/dialog/index.js'
import i18n                             from '@/renderer/common/i18n';
import { Notification }                 from 'element-ui';
import { lt }                           from 'semver';

/**
 * npmjs 开放的包查询接口
 */
class PluginProvider {
    constructor() {
        appIpc.on('plugin-discovery', async ({ module, type }) => this.getRecommendPluginList(module, type));
    }

    getPluginNameKeyword() {
        return window.constant.APPLICATION_PLUGINS_NAME_PREFIX.substring(0, window.constant.APPLICATION_PLUGINS_NAME_PREFIX.lastIndexOf('-'));
    }

    async search(keyword) {
        // TODO 2025年7月9日，在这一天，我发现 npm 的搜索就挺牛逼，通过 keyword 的骚操作就可以达到模糊搜索的效果，嘿嘿
        // if (keyword) {
        //     return await this.fuzzySearch.search(keyword);
        // }

        const installedPluginInfoList = await pluginManagerClient.getInstalledPluginList();
        
        try {
            // 当前版本为开启插件商店，只返回推荐的插件列表
            // TODO 主要是感觉目前没有解决安全问题，所以安全第一
            if(!pluginConfig.isPluginStoreEnabled()) {
                const pluginList = (await Promise.all(pluginConfig.recommendList().map(async (pluginName) => {
                    try {
                        return await pluginRegistryGateway.getPackage(pluginName,  installedPluginInfoList);
                    } catch(e){
                        // 无所谓的，有些错误其实也没有那么可怕，放过它就是放过自己，不完美恰恰可能最完美的
                    }
                }))).filter(Boolean);

                return pluginList;
            }    

            // 暂时应该不会超过100个插件，问题不大
            const pluginList = await pluginRegistryGateway.search(keyword, this.getPluginNameKeyword(), installedPluginInfoList);
            return pluginList.filter(item => item.pluginName.startsWith(window.constant.APPLICATION_PLUGINS_NAME_PREFIX) && pluginConfig.isNotBlackListPlugin(item.pluginName));
        } catch (e) {
            throw new Error(i18n.t('plugin.pluginListLoadFailed'), e);
        }
    }

    async getPlugin(name) {
        const installedPluginInfoList = await pluginManagerClient.getInstalledPluginList();

        try {
            return await pluginRegistryGateway.getPackage(name, installedPluginInfoList);
        } catch (e) {
            console.error(`获取单个插件失败, name:${name}`);
            throw e;
        }
    }

    /**
     * 根据模块 + 类型 获取推荐列表
     * 例如：
     *      数据源 + 数据源类型
     *      i18n  + 地区代码
     * @param {*} module 模块
     * @param {*} type 类型
     * @returns {*}
     */
    async getRecommendPluginList(module, type) {
        const recommendPluginInfo = pluginConfig.discoveryPlugin(module, type);
        if (!recommendPluginInfo?.plugins?.length) {
            return;
        }

        const installedPluginInfoList = await pluginManagerClient.getInstalledPluginList();

        const pluginList = [];
        for (let i = 0; i < recommendPluginInfo.plugins.length; i++) {
            const pluginName = recommendPluginInfo.plugins[i];

            if (installedPluginInfoList.find(plugin => plugin.pluginName === pluginName)) {
                continue;
            }

            const pluginInfo = await this.getPlugin(pluginName);
            pluginInfo.logoLoadSuccess = true;
            pluginInfo.ing = false;
            pluginList.push(pluginInfo);
        }

        if (!pluginList.length) {
            return;
        }

        Notification.info({
            title: i18n.t('plugin.recommendInstallHintTitle'),
            message: i18n.t('plugin.recommendInstallHintMessage', { title: recommendPluginInfo.title }),
            position: 'bottom-right',
            onClick: async () => {
                import('@/renderer/views/plugin/discovery.vue').then(module => {
                    const pluginDiscovery = module.default;
                    dialogHelper.openDialog({
                        component: pluginDiscovery,
                        title: i18n.t('plugin.recommendInstallTitle'),
                        width: 90,
                        params: {
                            pluginList
                        }
                    });
                });
            }
        });
    }

    /**
     * 确保内置插件安装
     * @returns {Promise<void>}
     */
    async ensureBuiltinPlugins() {
        const initPlugins = (window.constant && window.constant.initPlugins) || {};
        const pluginNames = Object.keys(initPlugins);
        if (pluginNames.length === 0) {
            return;
        }

        try {
            const installedPluginList = await pluginManagerClient.getInstalledPluginList();
            const pendingPluginList = pluginNames.map(pluginName => {
                const initVersion = initPlugins[pluginName];
                const installedPlugin = installedPluginList.find(plugin => plugin.pluginName === pluginName);
                if (installedPlugin && !lt(installedPlugin.version, initVersion)) {
                    return null;
                }

                return {
                    pluginId: `${pluginName}@${initVersion}`,
                    pluginName,
                    pluginNickName: pluginName,
                    version: initVersion,
                    targetVersion: initVersion,
                    installedVersion: installedPlugin ? installedPlugin.version : null,
                    installStatus: installedPlugin ? 'update' : 'uninstalled',
                    installState: 'pending',
                    logoLoadSuccess: false,
                    ing: false,
                    description: '',
                    author: '',
                };
            }).filter(Boolean);

            if (pendingPluginList.length === 0) {
                return;
            }

            import('@/renderer/views/plugin/discovery.vue').then(module => {
                const pluginDiscovery = module.default;
                dialogHelper.openDialog({
                    component: pluginDiscovery,
                    title: i18n.t('plugin.builtinInstallTitle'),
                    width: 88,
                    height: 82,
                    disableClose: true,
                    disableFullscreen: true,
                    params: {
                        pluginList: pendingPluginList,
                        autoInstall: true,
                        requireRestartAfterInstall: true,
                        lockDialogWhileInstalling: true
                    }
                });
            });
        } catch (error) {
            console.error('ensure builtin plugins error', error);
            Notification.error({
                title: i18n.t('plugin.builtinCheckFailedTitle'),
                message: i18n.t('plugin.builtinCheckFailedMessage', { error: error.message || error }),
                duration: 5000,
            });
        }
    }
}

export default new PluginProvider();
