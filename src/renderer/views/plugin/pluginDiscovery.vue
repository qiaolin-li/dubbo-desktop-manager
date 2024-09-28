<template>
    <el-dialog :title="title ? title : '插件安装' " width="90%" top="5vh" :visible.sync="dialogVisible" :close-on-click-modal="false">
        <div class="plugin-discovery-container">
            <split-pane @resize="resize" split="vertical" :min-percent="20" :default-percent="30">
                <template slot="paneL">
                    <pluginItem  v-for="item in pluginList" :key="item.name" :item="item" @selectPlugin="(item) => currentPlugin = item"></pluginItem>
                </template>
                <template slot="paneR">
                    <vs-layout :edit="false" :resize="state.resize" :splits="state.splits" v-show="currentPlugin">
                        <pluginDetails v-if="currentPlugin" class="plugin-content"  :plugin="currentPlugin" :allowUninstall="false" @installPlugin="installPlugin"></pluginDetails>
                        <vs-pane title="日志">
                            <pluginLog ref="pluginLog"></pluginLog>
                        </vs-pane>
                    </vs-layout>
                </template>
            </split-pane>
        </div>
    </el-dialog>
</template>

<script>

import { ipcRenderer }      from 'electron'
import pluginLog            from "@/renderer/views/plugin/log.vue";
import pluginDetails        from "@/renderer/views/plugin/details.vue";
import pluginProvider       from '@/renderer/api/plugin/PluginProvider';
import pluginManager        from "@/renderer/api/PluginManagerClient.js";
import pluginItem           from '@/renderer/views/plugin/list/pluginItem.vue';

export default {
    components: {
        pluginItem,
        pluginLog,
        pluginDetails
    },
    data() {
        return {
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
            title: '推荐插件安装',
            dialogVisible: false,
            pluginList: [],
            currentPlugin: null
        }
    },
    created() {
        ipcRenderer.on('plugin-discovery', async (sender, {module, type}) =>  {
            const pluginConfig = await pluginProvider.getRecommendPluginList(module, type);
            if(!pluginConfig?.plugins?.length) {
                return;
            }

            this.$notify.info({
                title: '推荐插件安装提示',
                message: `${pluginConfig.title}, 点击当前消息进行安装`,
                position: 'bottom-right',
                onClick: async () => {
                    const pluginList = pluginConfig.plugins;
                    if(pluginList.length === 0) {
                        return;
                    }

                    pluginList.forEach((item) => {
                        item.logoLoadSuccess = true;
                        item.ing = false;
                    });

                    this.pluginList = pluginList;
                    this.currentPlugin = pluginList[0];
                    this.dialogVisible = true;
                }
            });
            
        });
    },
    destroyed() {
        ipcRenderer.removeAllListeners('plugin-discovery');
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
            } finally {
                plugin.ing = false;
            }
        },
    }
}
</script>

<style>
.plugin-discovery-container {
    height: 80vh;
}
</style>