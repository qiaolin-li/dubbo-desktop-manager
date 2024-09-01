<template>
    <div class="plugin-view">
        <el-input v-model="searchText" placeholder="搜索npm上的插件，或者点击上方按钮查看优秀插件列表" size="small"  @input="searchPluginListFun" >
            <template #prefix></template>
        </el-input>
        <div class="plugin-list" v-loading="loading">
            <pluginItem  v-for="item in pluginList" :key="item.name" :item="item" @selectPlugin="(item) => $emit('selectPlugin', item)"></pluginItem>
        </div>
    </div>
  </template>
  
<script>
import lodash               from "lodash";
import pluginManager        from "@/renderer/api/PluginManagerClient.js";

import pluginItem from './pluginItem.vue';

export default {
    components: {
        pluginItem
    },
    data() {
        return {
            searchText: '',
            pluginList: [],
            loading: false
        }
    },
    created() {
        this.searchPluginListFun = lodash.debounce(async () => this.searchPluginList(), 300)
        this.searchPluginListFun();

        this.$bus.$on("plugin-uninstalled", this.syncPluginStatus);
        this.$bus.$on("plugin-installed",  this.syncPluginStatus);
    },
    beforeDestroy() {
        this.$bus.$off("plugin-uninstalled", this.syncPluginStatus);
        this.$bus.$off("plugin-installed", this.syncPluginStatus);
    },
    methods: {
        async searchPluginList () {
            try {
                const pluginList = await pluginManager.search(this.searchText);
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
            pluginInfo.installStatus = plugin.installStatus;
        }
    }
}
</script>

<style>
  
</style>
  