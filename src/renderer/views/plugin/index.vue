<template>
    <div class="plugin-container">
        <split-pane @resize="resize" split="vertical" :min-percent="20" :default-percent="30">
            <template slot="paneL">
                <list @selectPlugin="selectPlugin"></list>
            </template>
            <template slot="paneR">
                <vs-layout :edit="false" :resize="state.resize" :splits="state.splits" v-if="currentPlugin">
                    <pluginDetails  class="plugin-content"  :plugin="currentPlugin" @installPlugin="installPlugin" @uninstallPlugin="uninstallPlugin"></pluginDetails>
                    <vs-pane title="日志">
                        <pluginLog></pluginLog>
                    </vs-pane>
                </vs-layout>
            </template>
        </split-pane>
        
    </div>
</template>
<script>
import lodash               from "lodash";
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
            searchText: "",
            pluginList: [],
            pluginNameList: [],
            loading: false,
            currentPlugin: null,
            state: {
                extraStyle: false,
                edit: true,
                resize: true,
                splits:   {
                    dir: 'vertical',
                    first: 0,
                    second: 1,
                    split: '80%' 
                },
                layoutN: 0
            },
        };
    },
    created() {
        this.searchPluginListFun = lodash.debounce(async () => this.searchPluginList(), 300)
        this.searchPluginListFun();
    },
    methods: {
        resize() {},
        searchPluginListFun(){},
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
        async searchPluginList () {
            try {
                const pluginList = await pluginManager.search(this.searchText);
                pluginList.forEach((item) => {
                    item.logoLoadSuccess = true;
                    item.ing = false;
                })

                this.pluginList = pluginList;
                this.selectPlugin(this.pluginList[0] || {})
                this.loading = false;
            } catch(err) {
                console.log(err);
                this.loading = false;
            }
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
}

.plugin-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 2px;
    cursor: pointer;
    height: 60px;
    border-top: 1px solid pink;
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