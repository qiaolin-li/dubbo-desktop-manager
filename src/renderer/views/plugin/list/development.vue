<template>
    <div class="plugin-view">
        <div class="plugin-toolbar">
            <span class="plugin-toolbar__add" @click="addPlugin()">
            <i class="el-icon-plus"></i>{{` ${$t('plugin.addPlugin')}`}}</span>
        </div>
        <div class="plugin-list" v-loading="loading">
            <pluginItem  v-for="plugin in pluginList" :key="plugin.pluginName" :plugin="plugin" :showDownloads="false" @selectPlugin="(plugin) => $emit('selectPlugin', plugin)">
                <el-tooltip effect="light" :content="$t('base.delete')" placement="right-start">
                    <i class="el-icon-delete iconButton" @click.stop="removePlugin(plugin.path)"></i>
                </el-tooltip>
            </pluginItem>
        </div>
    </div>
</template>

<script>
import appRenderer, { appDialog }            from '@/renderer/core/AppRenderer.js';
import pluginManager            from "@/renderer/api/PluginManagerClient.js";
import pluginItem               from './pluginItem.vue';

export default {
    components: {
        pluginItem
    },
    data() {
        return {
            pluginList: [],
            loading: false
        }
    },
    created() {
        this.getPluginList();
        appRenderer.on("plugin-uninstalled", this.syncPluginStatus);
        appRenderer.on("plugin-installed",  this.syncPluginStatus);
    },

    beforeDestroy() {
        appRenderer.off("plugin-uninstalled", this.syncPluginStatus);
        appRenderer.off("plugin-installed", this.syncPluginStatus);
    },
    methods: {
        async addPlugin () {
            let filePaths = appDialog.showOpenDialogSync({
                title: "选择目录",
                defaultPath: "./",
                properties: [
                    "openDirectory",
                    "createDirectory"
                ]
            })

            if (!filePaths) {
                return;
            }

            try {
                await pluginManager.addDevelopmentPlugin(filePaths[0]);
                this.getPluginList();
            } catch(err) {
                console.log(err);
            }
        },
        async removePlugin (pluginPath) {
            this.$confirm(this.$t('plugin.confirmDeleteConnect'), this.$t('base.hintTitle'), {
                confirmButtonText: this.$t('base.confirm'),
                cancelButtonText: this.$t('base.cancel'),
                closeOnClickModal: false,
                type: "warning",
            }).then(async () => {
                try {
                    await pluginManager.removeDevelopmentPlugin(pluginPath);
                    this.getPluginList();
                } catch(err) {
                    console.log(err);
                }
            });

        },
        async getPluginList () {
            try {
                const pluginList = await pluginManager.getDevelopmentPluginList();
            
                pluginList.forEach((plugin) => {
                    plugin.logoLoadSuccess = true;
                    plugin.ing = false;
                })

                this.pluginList = pluginList;
                this.loading = false;
            } catch(err) {
                console.log(err);
                this.loading = false;
            }
        },

        syncPluginStatus(plugin) {
            const pluginInfo = this.pluginList.find(p => p.pluginName === plugin.pluginName);
            if (!pluginInfo) return;
            pluginInfo.installStatus = plugin.installStatus === 'installed' ? 'update' : plugin.installStatus;
        }

    }
}
</script>

<style>
.plugin-toolbar {
    margin: 6px 10px;
}

.plugin-view {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--app-theme-surface);
}

.plugin-view .plugin-list {
    flex: 1;
    overflow-y: auto;
    background: var(--app-theme-surface);
}

.plugin-toolbar .plugin-toolbar__add {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 26px;
    padding: 0 6px;
    border-radius: 4px;
    color: var(--app-theme-text-secondary);
    cursor: pointer;
    transition: background-color .15s ease, color .15s ease;
}

.plugin-toolbar .plugin-toolbar__add:hover {
    background: var(--app-theme-hover-background);
}
</style>
  
