<template>
    <div class="plugin-view">
        <div class="plugin-toolbar">
            <span class="btn-plus" @click="addPlugin()">
            <i class="el-icon-plus"></i>{{` ${$t('plugin.addPlugin')}`}}</span>
        </div>
        <div class="plugin-list" v-loading="loading">
            <pluginItem  v-for="item in pluginList" :key="item.name" :item="item" @selectPlugin="(item) => $emit('selectPlugin', item)">
                <el-tooltip effect="light" :content="$t('base.delete')" placement="right-start">
                    <i class="el-icon-delete iconButton" @click.stop="removePlugin(item.path)"></i>
                </el-tooltip>
            </pluginItem>
        </div>
    </div>
  </template>
  
<script>
import pluginManager        from "@/renderer/api/PluginManagerClient.js";

import pluginItem from './pluginItem.vue';

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
        this.$bus.$on("plugin-uninstalled", this.syncPluginStatus);
        this.$bus.$on("plugin-installed",  this.syncPluginStatus);
    },

    beforeDestroy() {
        this.$bus.$off("plugin-uninstalled", this.syncPluginStatus);
        this.$bus.$off("plugin-installed", this.syncPluginStatus);
    },
    methods: {
        async addPlugin () {
            let filePaths = this.$remote.dialog.showOpenDialogSync({
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
                pluginList.forEach((item) => {
                    item.logoLoadSuccess = true;
                    item.ing = false;
                })

                this.pluginList = pluginList;
                this.loading = false;
            } catch(err) {
                console.log(err);
                this.loading = false;
            }
        },

        syncPluginStatus(plugin) {
            const pluginInfo = this.pluginList.find(item => item.name === plugin.name);
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
</style>
  