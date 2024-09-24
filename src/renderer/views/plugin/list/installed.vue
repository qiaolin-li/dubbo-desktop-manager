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
        this.$bus.$on("plugin-uninstalled", this.getPluginList);
        this.$bus.$on("plugin-installed", this.getPluginList);
    },

    beforeDestroy() {
        this.$bus.$off("plugin-uninstalled", this.getPluginList);
        this.$bus.$off("plugin-installed", this.getPluginList);
    },
    methods: {
        async getPluginList () {
            try {
                const pluginList = await pluginManager.getInstalledPluginList();
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

    }
}
</script>

<style>
  
</style>
  