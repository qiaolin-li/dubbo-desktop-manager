import appMain from 'appMain';

/**
 * 主进程入口由 DDM 宿主加载。
 */
export default function installMain() {
    return {
        async install() {
            appMain.logger.info('__PLUGIN_TITLE__ main installed');

            /**
             * 暴露给渲染进程调用的服务，渲染端通过 referenceService('helloService') 获取。
             */
            appMain.exportPluginService('helloService', {
                async sayHello(name) {
                    return {
                        message: `Hello ${name || 'DDM'} from ${appMain.pluginName}`,
                        time: new Date().toISOString(),
                    };
                },
            });
        },

        /**
         * 插件卸载时宿主会优先调用 uninstall，可在这里释放资源。
         */
        async uninstall() {
            appMain.logger.info('__PLUGIN_TITLE__ main uninstalled');
        },
    };
}
