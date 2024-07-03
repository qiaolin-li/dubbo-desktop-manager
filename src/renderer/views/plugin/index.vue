<template>
    <split-pane @resize="resize" split="vertical" :min-percent="20" :default-percent="30">
        <template slot="paneL">
            <div class="plugin-view">
                <el-input v-model="searchText" placeholder="搜索npm上的PicGo插件，或者点击上方按钮查看优秀插件列表" size="small"  @input="getSearchResult" ></el-input>
                <div class="plugin-list" v-loading="loading">
                    <div class="plugin-item" v-for="item in pluginList" :key="item.name" @click="currentPlugin = item">
                        <img class="plugin-item__logo" v-if="item.logoLoadSuccess" :src="item.logo" @error="() => item.logoLoadSuccess = false" />
                        <img class="plugin-item__logo"  v-else src="../../assets/icon.png"/>
                        <div class="plugin-item__content" :class="{ disabled: !item.enabled }">
                            <div class="plugin-item__content_info">
                                <div class="plugin-item__name">{{ item.name }}</div>
                                <div>
                                    <span class="config-button ing" v-if="item.hasInstall && !item.ing" > 已安装 </span>
                                    <span class="config-button ing" v-if="!currentPlugin.enabled" > 已禁用 </span>
                                    <span v-if="!item.hasInstall && item.ing" class="config-button ing">安装中</span>
                                </div>
                            </div>
                            <!-- <div class="plugin-item__desc" :title="item.description">{{ item.description }}</div> -->
                            <div> 
                                <span class="plugin-item__version">{{ item.version }}</span>
                                <span class="plugin-item__author">{{ item.author }}</span>
                            </div>    

                        </div>
                    </div>
                </div>
            </div>
        </template>
        <template slot="paneR">
            <div class="plugin-content" :class="{ disabled: !currentPlugin.enabled }">
                <div class="plugin-name">{{ currentPlugin.name }} <small>{{ " " + currentPlugin.version }}</small></div>
                <div>
                    <span class="plugin-author">{{ currentPlugin.author }}</span>
                    <span class="plugin-home"  @click="openHomepage(currentPlugin.homepage)">{{ currentPlugin.author }}</span>
                </div>
                <div>
                    <span class="config-button ing" v-if="currentPlugin.hasInstall && !currentPlugin.ing" > 已安装 </span>
                    <span class="config-button install" v-if="!currentPlugin.hasInstall && !currentPlugin.ing" @click="installPlugin(currentPlugin)">安装</span>
                    <span class="config-button install" v-if="currentPlugin.hasInstall && !currentPlugin.ing" @click="uninstallPlugin(currentPlugin)">卸载</span>
                    <span v-if="!currentPlugin.hasInstall && currentPlugin.ing" class="config-button ing">安装中</span>
                    <div>
                        <i v-if="currentPlugin.enabled" class="el-icon-setting" @click="buildContextMenu(currentPlugin)"></i>
                        <i v-else class="el-icon-remove-outline" @click="buildContextMenu(currentPlugin)"></i>
                    </div>
                </div>
                <div class="plugin-desc" :title="currentPlugin.description">{{ currentPlugin.description }}</div>
            </div>
        </template>
    </split-pane>
</template>
<script>
import appConfig from "@/renderer/api/AppConfigClient.js";
import pluginManager from "@/renderer/api/PluginManagerClient.js";
const remote = require("@electron/remote");
const pluginPrefix = "ddp-plugin-";

export default {
    name: "plugin",
    components: {
    },
    data() {
        return {
            searchText: "",
            pluginList: [],
            pluginNameList: [],
            loading: false,
            currentPlugin: {}
        };
    },
    created() {
        this.getSearchResult();
    },
    methods: {
        resize() {},
        async installPlugin(plugin) {
            try {
                plugin.ing = true;
                await pluginManager.install(plugin.id, plugin.version)

                this.$message({
                    type: "success",
                    message: `插件【${plugin.name}-${plugin.version}】安装成功`,
                });
                plugin.hasInstall = true;
                this.handleReload();
            } finally {
                plugin.ing = false;
            }
        },
        async uninstallPlugin(plugin) {
            try {
                plugin.ing = true;
                await pluginManager.uninstall(plugin.id)
                plugin.hasInstall = false;
                this.$message({
                    type: "success",
                    message: `插件【${plugin.name}】卸载成功`,
                });
            } finally {
                plugin.ing = false;
            }
        },
        updatePlugin(plugin) {
            plugin.ing = true;
            this.$electron.ipcRenderer.send("updatePlugin", plugin.name);
            plugin.ing = false;
            plugin.hasInstall = true;
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
        async getSearchResult () {

            const searchVal = this.searchText.match(pluginPrefix)
                ? this.searchText
                : this.searchText !== "" ? pluginPrefix + this.searchText : pluginPrefix;

            try {
                const pluginList = await pluginManager.search(searchVal);
                pluginList.forEach((item) => {
                    item.logoLoadSuccess = true;
                    item.ing = false;
                })

                this.pluginList = pluginList;
                this.currentPlugin = this.pluginList[0] || {};
                this.loading = false;
            } catch(err) {
                console.log(err);
                this.loading = false;
            }
        },
        openHomepage(url) {
            if (url) remote.shell.openExternal(url);
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
                    click: () => this.updatePlugin(plugin)
                },
            ];

            const menu = remote.Menu.buildFromTemplate(menuTemplate);
            menu.popup({ window: remote.getCurrentWindow()});
        },
    },
};
</script>
<style>
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
}

.plugin-item__content_info {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    height: 100%;
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