<template>
    <div class="plugin-container">
        <split-pane @resize="resize" split="vertical" :min-percent="20" :default-percent="25">
            <template slot="paneL">
                <list @selectPlugin="selectPlugin"></list>
            </template>
            <template slot="paneR">
                <dragTab :fisrtTabProps="fisrtTabProps" fisrtDefaultName="default" :secondTabProps="secondTabProps" secondDefaultName="default" :collapsible="false" :fisrtTabVisible="false">
                    <template slot="fisrtContent">
                        <dragTabItem name="default" >
                            <pluginDetails  class="plugin-content" v-if="currentPlugin" :plugin="currentPlugin" @installPlugin="installPlugin" @uninstallPlugin="uninstallPlugin"></pluginDetails>
                        </dragTabItem>
                    </template>

                    <template slot="secondContent">
                        <dragTabItem name="default"  >
                            <pluginLog ref="pluginLog"></pluginLog>
                        </dragTabItem>
                    </template>
                </dragTab>
            </template>
        </split-pane>
        
    </div>
</template>
<script>
import pluginDetails        from "./details.vue";
import pluginLog            from "./log.vue";
import appConfig            from "@/renderer/api/AppConfigClient.js";
import pluginManager        from "@/renderer/api/PluginManagerClient.js";
import list                 from "./list/index.vue";
const remote = require("@electron/remote");

export default {
    name: "plugin",
    components: {
        pluginDetails,
        pluginLog,
        list
    },
    data() {
        return {
            currentPlugin: null,
            fisrtTabProps: [{
                name: "default",
                titel: "",
            }],
            secondTabProps: [{
                name: "default",
                titel: "日志",
            }],
        };
    },
    methods: {
        resize() {},
        async installPlugin(plugin) {
            try {
                plugin.ing = true;
                await pluginManager.install(plugin)

                this.$message({
                    type: "success",
                    message: `插件【${plugin.name}-${plugin.version}】安装成功`,
                });
                plugin.installStatus = 'installed';
                this.$bus.$emit("plugin-installed", plugin);
                this.handleReload();
            } finally {
                plugin.ing = false;
            }
        },
        async uninstallPlugin(plugin) {
            try {
                plugin.ing = true;
                await pluginManager.uninstall(plugin)
                plugin.installStatus = 'uninstalled';
                this.$bus.$emit("plugin-uninstalled", plugin);
                this.$message({
                    type: "success",
                    message: `插件【${plugin.name}】卸载成功`,
                });
            } finally {
                plugin.ing = false;
            }
        },
        handleReload() {
            const successNotification = new window.Notification("更新成功", {
                body: "请点击此通知重启应用以生效",
            });
            successNotification.onclick = () => {
                remote.app.relaunch();
                remote.app.exit(0);
            };
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
                        const pluginConfig = appConfig.getProperty['pluginConfig'];
                        pluginConfig[plugin.name] = true;
                        appConfig.setProperty("pluginConfig", pluginConfig);
                        plugin.enabled = true;
                    },
                },
                {
                    label: "禁用插件",
                    enabled: plugin.enabled,
                    click: () => {
                        const pluginConfig = appConfig.getProperty['pluginConfig'];
                        pluginConfig[plugin.name] = false;
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

            const menu = remote.Menu.buildFromTemplate(menuTemplate);
            menu.popup({ window: remote.getCurrentWindow()});
        },
    },
};
</script>
<style>
.plugin-container {
    height: 100%;    
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
  border-top: 1px solid #ccc;
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

.plugin-item__content_info {
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