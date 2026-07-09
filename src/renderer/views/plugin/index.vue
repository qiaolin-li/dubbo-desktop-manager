<template>
    <div class="plugin-page">
        <app-split-pane @resize="resize" split="vertical" :min-percent="20" :default-percent="25">
            <template slot="paneL">
                <list class="notSelect" @selectPlugin="selectPlugin"></list>
            </template>
            <template slot="paneR">
                <pluginDetails  class="plugin-page__content" v-if="currentPlugin" :plugin="currentPlugin" @installPlugin="installPlugin" @uninstallPlugin="uninstallPlugin"></pluginDetails>
            </template>
        </app-split-pane>
        
    </div>
</template>
<script>
import appRenderer, { appWindow, appConfig, appMenu }        from '@/renderer/core/AppRenderer.js';

import pluginManager                                         from "@/renderer/api/PluginManagerClient.js";
import pluginDetails                                         from "@/renderer/views/plugin/details.vue";
import list                                                  from "@/renderer/views/plugin/list/index.vue";

import { useLayoutStore }                                    from '@/renderer/store/modules/layout.js';

export default {
    name: "plugin",
    components: {
        pluginDetails,
        list
    },
    data() {
        return {
            currentPlugin: null,
            layoutStore: useLayoutStore(),
        };
    },
    methods: {
        resize() {},
        async installPlugin(plugin) {
            try {
                this.layoutStore.showWorkbench();
                plugin.ing = true;
                await pluginManager.install(plugin)

                plugin.installStatus = 'installed';
                appRenderer.emit("plugin-installed", plugin);
                this.handleReload(`插件【${plugin.pluginNickName}@${plugin.version}】安装成功`);
            } finally {
                plugin.ing = false;
            }
        },
        
        async uninstallPlugin(plugin) {
            try {
                this.layoutStore.showWorkbench();
                plugin.ing = true;
                await pluginManager.uninstall(plugin)
                plugin.installStatus = 'uninstalled';
                appRenderer.emit("plugin-uninstalled", plugin);
                this.handleReload(`插件【${plugin.pluginNickName}】卸载成功`);
            } finally {
                plugin.ing = false;
            }
        },
        handleReload(message) {
            this.$confirm(`${message}, 是否立即重启?`, '提示', {
                cancelButtonText: '稍后重启',
                confirmButtonText: '立即重启',
                closeOnClickModal: false,
                buttonOrder: ['confirm', 'cancel'],
                type: 'warning'
            }).then(() => {
                appWindow.restart();
            });
        },
        async selectPlugin(plugin){
            this.currentPlugin = plugin;
        },
        buildContextMenu(plugin) {
            let menuTemplate = [
                {
                    label: "启用插件",
                    enabled: !plugin.enabled,
                    click: () => {
                        const pluginConfig = appConfig.getProperty('pluginConfig') || {};
                        pluginConfig[plugin.pluginName] = true;
                        appConfig.setProperty("pluginConfig", pluginConfig);
                        plugin.enabled = true;
                    },
                },
                {
                    label: "禁用插件",
                    enabled: plugin.enabled,
                    click: () => {
                        const pluginConfig = appConfig.getProperty('pluginConfig') || {};
                        pluginConfig[plugin.pluginName] = false;
                        appConfig.setProperty("pluginConfig", pluginConfig);
                        plugin.enabled = false;
                    },
                },
                {
                    label: "卸载插件",
                    click: () => this.uninstallPlugin(plugin)
                },
                {
                    label: "更新插件",
                    // click: () => this.updatePlugin(plugin)
                },
            ];

            appWindow.popupMenu({ template: menuTemplate });
        },
    },
};
</script>
<style>
.el-message-box__btns {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-direction: row-reverse;
}

.plugin-page {
    height: 100%;
    background: var(--app-theme-surface);
}

.plugin-list {
    height: 100%;
    width: 100%;
    overflow-y: auto;
}

.plugin-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 2px;
    cursor: pointer;
    height: 60px;
    /* border-top: 1px solid pink; */
}

.plugin-item:not(:first-child) {
    border-top: 1px solid var(--app-theme-border);
}

.plugin-item__logo {
    width: 55px;
    height: 55px;
    padding: 0px 5px;
}

.plugin-item__content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
}

.plugin-item__content-info {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
}

.plugin-item__name {
    font-size: 16px;
    font-weight: 600;
    height: 22px;
    line-height: 22px;
    cursor: pointer;
    transition: all .2s ease-in-out;
}
</style>
