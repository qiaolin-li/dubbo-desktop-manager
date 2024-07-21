<template>
    <div class="plugin-container">
        <split-pane @resize="resize" split="vertical" :min-percent="20" :default-percent="30">
            <template slot="paneL">
                <div class="plugin-view">
                    <el-input v-model="searchText" placeholder="搜索npm上的插件，或者点击上方按钮查看优秀插件列表" size="small"  @input="getSearchResult" >
                      <template #prefix></template>
                    </el-input>
                    <div class="plugin-list" v-loading="loading">
                        <div class="plugin-item element-hover" v-for="item in pluginList" :key="item.name" @click="selectPlugin(item)">
                            <img class="plugin-item__logo" v-if="item.logoLoadSuccess" :src="item.logo" @error="() => item.logoLoadSuccess = false" />
                            <img class="plugin-item__logo"  v-else src="../../assets/icon.png"/>
                            <div class="plugin-item__content" :class="{ disabled: !item.enabled }">
                                <div class="plugin-item__content_info">
                                    <div class="plugin-item__name">{{ item.name }}</div>
                                    <div>
                                        <span class="config-button ing" v-if="item.installStatus === 'installed' && !item.ing" > 已安装</span>
                                        <span class="config-button ing" v-if="item.installStatus === 'update' && !item.ing" >更新</span>
                                        <span class="config-button ing" v-if="item.installStatus === 'update' && item.ing" >更新中</span>
                                        <span class="config-button ing" v-if="item.installStatus === 'uninstalled' && !item.ing" >安装</span>
                                        <span class="config-button ing" v-if="item.installStatus === 'uninstalled' && item.ing" >安装中</span>
                                        <!-- <span class="config-button ing" v-if="item.installStatus === 'disabled'" > 已禁用 </span> -->
                                    </div>
                                </div>
                                <div> 
                                    <span class="plugin-item__version">{{ item.version }}</span>
                                    <span>&nbsp;&nbsp;</span>
                                    <span class="plugin-item__author">{{ item.author }}</span>
                                </div>    
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <template slot="paneR">
                <pluginDetails  class="plugin-content"  :plugin="currentPlugin" @installPlugin="installPlugin" @uninstallPlugin="uninstallPlugin"></pluginDetails>
            </template>
        </split-pane>
    </div>
</template>
<script>
import appConfig from "@/renderer/api/AppConfigClient.js";
import pluginManager from "@/renderer/api/PluginManagerClient.js";
const remote = require("@electron/remote");
import lodash from "lodash";
import pluginDetails from "./details.vue";


export default {
    name: "plugin",
    components: {
        pluginDetails,
    },
    data() {
        return {
            searchText: "",
            pluginList: [],
            pluginNameList: [],
            loading: false,
            currentPlugin: {},
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
                await pluginManager.install(plugin)

                this.$message({
                    type: "success",
                    message: `插件【${plugin.name}-${plugin.version}】安装成功`,
                });
                plugin.installStatus = 'installed';
                this.handleReload();
            } finally {
                plugin.ing = false;
            }
        },
        async uninstallPlugin(plugin) {
            try {
                plugin.ing = true;
                await pluginManager.uninstall(plugin.id)
                plugin.installStatus = 'uninstalled';
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
        async getSearchResult () {
            const searchResult = lodash.throttle(async () => {
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
            }, 1000)

            return searchResult();
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