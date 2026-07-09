import axios                    from 'axios';
import i18n                     from '@/renderer/common/i18n';
import localConfig              from './LocalConfig'
import appRenderer              from '@/renderer/core/AppRenderer';

const configUrl = 'https://cdn.jsdelivr.net/npm/ddm-plugin-config/config.json';

const createTestConfig = () => ({
    pluginStoreSwitch: true,
    recommendList: [
        'ddm-plugin-dubbo-support',
        'ddm-plugin-http-support',
        'ddm-plugin-springcloud-support',
        'ddm-plugin-demo',
    ],
    blacklist: [],
    discoveryPlugin: {
        projectPage: {
            zookeeper: {
                title: i18n.t('plugin.dataSourceNeedPluginTitle', { type: 'zookeeper' }),
                plugins: [
                    'ddm-plugin-dubbo-support',
                ]
            },
            nacos: {
                title: i18n.t('plugin.dataSourceNeedPluginTitle', { type: 'nacos' }),
                plugins: [
                    'ddm-plugin-dubbo-support'
                ]
            },
            'dubbo-admin': {
                title: i18n.t('plugin.dataSourceNeedPluginTitle', { type: 'dubbo-admin' }),
                plugins: [
                    'ddm-plugin-dubbo-support'
                ]
            }
        },
        dataSource: {
            zookeeper: {
                title: i18n.t('plugin.dataSourceNeedPluginTitle', { type: 'zookeeper' }),
                plugins: [
                    'ddm-plugin-dubbo-support',
                    'ddm-plugin-demo'
                ]
            },
            nacos: {
                title: i18n.t('plugin.dataSourceNeedPluginTitle', { type: 'nacos' }),
                plugins: [
                    'ddm-plugin-dubbo-support'
                ]
            },
            'dubbo-admin': {
                title: i18n.t('plugin.dataSourceNeedPluginTitle', { type: 'dubbo-admin' }),
                plugins: [
                    'ddm-plugin-dubbo-support'
                ]
            }
        },
        i18n: {
            'zh-TW': [
                'ddm-plugin-i18n-zh-TW'
            ]
        }
    }
});

class PluginConfig {
    constructor() {
        this.init();
    }

    async init() {
        if (window.constant.IS_DEVELOPMENT) {
            this.config = createTestConfig();
            return;
        }

        const res = await axios.get(configUrl);
        this.config = res.data;
    }

    /**
     * 插件商店是否开启，如果关闭，只会让用户看到推荐插件列表
     * @returns {boolean}
     */
    isPluginStoreEnabled() {
        // TODO 这个版本我觉得还不够安全，先关闭插件商店吧
        return window.constant.IS_DEVELOPMENT || appRuntime.isDeveloperMode();
        // return this.config?.pluginStoreSwitch ?? true;
    }

    /**
     * 获取推荐的插件列表
     * @returns {string[]}
     */
    recommendList() {
        return this.config?.recommendList ?? localConfig.recommendList ?? [];
    }

    /**
     * 一个插件是否在推荐列表之中
     * @param {string} pluginName - 插件名称
     * @returns {boolean} true: 在推荐列表，false: 不在推荐列表
     */
    isRecommendPlugin(pluginName) {
        return this.recommendList().includes(pluginName);
    }

    /**
     * 黑名单插件列表，防止有人搞破坏
     * @returns {string[]}
     */
    blacklist() {
        return this.config?.blacklist?.length ? this.config.blacklist : ['ddm-plugin-config'];
    }

    /**
     * 一个插件是否在黑名单之中
     * @param {string} pluginName - 插件名称
     * @returns {boolean} true表示在黑名单之中
     */
    isBlackListPlugin(pluginName) {
        return this.blacklist().includes(pluginName);
    }

    /**
     * 一个插件是否不在黑名单之中
     * @param {string} pluginName - 插件名称
     * @returns {boolean} true表示不在黑名单之中
     */
    isNotBlackListPlugin(pluginName) {
        return !this.isBlackListPlugin(pluginName);
    }

    /**
     * 获取推荐的插件列表
     * @param {*} module
     * @param {*} type 插件类型，dataSource、i18n，未来可能会更多
     * @returns {*}
     */
    discoveryPlugin(module, type) {
        return this.config?.discoveryPlugin?.[module]?.[type] || localConfig.discoveryPlugin?.[module]?.[type]  || null;
    }
}

export default new PluginConfig();
