import i18n                     from '@/renderer/common/i18n';

export default {
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
        i18n: {
            'zh-TW': [
                'ddm-plugin-i18n-zh-TW'
            ]
        }
    }
}