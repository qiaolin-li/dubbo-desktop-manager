<template>
    <div class="plugin-view">
        <div class="plugin-list" v-loading="loading">
            <pluginItem  v-for="item in pluginList" :key="item.name" :item="item" @selectPlugin="(item) => $emit('selectPlugin', item)"></pluginItem>
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
        async getPluginList () {
            try {
                const pluginList = await pluginManager.getDevelopmentPluginList();
                pluginList.forEach((item) => {
                    item.logoLoadSuccess = true;
                    item.ing = false;
                })

                this.pluginList = pluginList;
                this.$emit('selectPlugin', this.pluginList[0] || {})
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
  
</style>
  