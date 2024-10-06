<template>
    <div class="plugin-discovery-container">
        <split-pane @resize="resize" split="vertical" :min-percent="20" :default-percent="30">
            <template slot="paneL">
                <pluginItem  v-for="item in pluginList" :key="item.name" :item="item" @selectPlugin="(item) => currentPlugin = item"></pluginItem>
            </template>
            <template slot="paneR">
                <dragTab :fisrtTabProps="fisrtTabProps" fisrtDefaultName="default" :secondTabProps="secondTabProps" secondDefaultName="default" :collapsible="false" :fisrtTabVisible="false">
                    <template slot="fisrtContent">
                        <dragTabItem name="default" >
                            <pluginDetails v-if="currentPlugin" class="plugin-content"  :plugin="currentPlugin" :allowUninstall="false" @installPlugin="installPlugin"></pluginDetails>
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

import pluginLog            from "@/renderer/views/plugin/log.vue";
import pluginDetails        from "@/renderer/views/plugin/details.vue";
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
            fisrtTabProps: [{
                name: "default",
                titel: "",
            }],
            secondTabProps: [{
                name: "default",
                titel: "日志",
            }],
            title: '推荐插件安装',
            currentPlugin: null
        }
    },
    props: {
        pluginList: Array,
    },
    mounted() {
        
        this.currentPlugin = this.pluginList[0];
        this.fisrtTabProps[0].titel = this.pluginList[0].name
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