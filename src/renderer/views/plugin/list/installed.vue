<template>
    <div class="plugin-view">
        <div class="plugin-list" v-loading="loading">
            <pluginItem  v-for="plugin in pluginList" :key="plugin.pluginId" :plugin="plugin" :showDownloads="false" @selectPlugin="(plugin) => $emit('selectPlugin', plugin)"></pluginItem>
        </div>
    </div>
</template>
<script>
import appRenderer            from '@/renderer/core/AppRenderer.js';
import pluginManager          from "@/renderer/api/PluginManagerClient.js";

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
        appRenderer.on("plugin-uninstalled", this.getPluginList);
        appRenderer.on("plugin-installed", this.getPluginList);
    },

    beforeDestroy() {
        appRenderer.off("plugin-uninstalled", this.getPluginList);
        appRenderer.off("plugin-installed", this.getPluginList);
    },
    methods: {
        async getPluginList () {
            try {
                const pluginList = await pluginManager.getInstalledPluginList();
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

    }
}
</script>

<style>
.plugin-view {
    height: 100%;
    overflow: hidden;
    background: var(--app-theme-surface);
}

.plugin-view .plugin-list {
    height: 100%;
    overflow-y: auto;
    background: var(--app-theme-surface);
}
</style>
