import appView  from 'appView';
import Settings from './views/Settings.vue';

/**
 * 渲染进程入口由 DDM 宿主加载。
 */
export default function installRenderer() {
    return {
        async install() {
            /**
             * 调用主进程通过 exportPluginService 暴露的服务。
             */
            const helloService = appView.referenceService('helloService');

            /**
             * 注册一个插件设置页，Settings 组件会被宿主自动注入插件上下文。
             */
            appView.addPluginSettingPage({
                label: '__PLUGIN_TITLE__',
                component: Settings,
            });

            /**
             * 注册标题栏菜单，演示渲染进程调用主进程服务后发通知。
             */
            appView.addToolbarMenu({
                label: '__PLUGIN_TITLE__',
                icon: 'el-icon-watermelon',
                click: async () => {
                    const result = await helloService.sayHello('__PLUGIN_TITLE__');
                    appView.notify({
                        title: '__PLUGIN_TITLE__',
                        body: result.message,
                    });
                },
            });
        },
    };
}
