/**
 * i18n 入口用于注册当前插件自己的语言包。
 */
export default function installI18n(registrar) {
    return {
        async install() {
            registrar.addPluginLocaleMessage('zh-CN', {
                title: '中文语言包: __PLUGIN_TITLE__',
            });
            registrar.addPluginLocaleMessage('en-US', {
                title: '__PLUGIN_TITLE__',
            });
        },
    };
}
