<template>
    <div class="plugin-view">
        <el-input v-model="searchText" placeholder="搜索npm上的插件" size="small"  @input="searchPluginListFun" >
            <template #prefix></template>
            <el-tooltip slot="append" effect="light" :content="$t('base.refresh')" placement="top">
                <el-button icon="el-icon-refresh" @click="searchPluginList"></el-button>
            </el-tooltip>
        </el-input>
        <div class="plugin-list" v-loading="loading">
            <pluginItem  v-for="plugin in pluginList" :key="plugin.pluginName" :plugin="plugin" @selectPlugin="(plugin) => $emit('selectPlugin', plugin)"></pluginItem>
        </div>
    </div>
</template>
<script>
import appRenderer            from '@/renderer/core/AppRenderer.js';
import lodash               from "lodash";
import pluginProvider       from "@/renderer/api/plugin/PluginProvider";
import pluginItem           from './pluginItem.vue';

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

        appRenderer.on("plugin-uninstalled", this.syncPluginStatus);
        appRenderer.on("plugin-installed",  this.syncPluginStatus);
    },
    beforeDestroy() {
        appRenderer.off("plugin-uninstalled", this.syncPluginStatus);
        appRenderer.off("plugin-installed", this.syncPluginStatus);
    },
    methods: {
        async searchPluginList () {
            try {
                const pluginList = await pluginProvider.search(this.searchText);
                
                pluginList.forEach((plugin) => {
                    plugin.logoLoadSuccess = true;
                    plugin.ing = false;
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
            const pluginInfo = this.pluginList.find(item => item.name === plugin.pluginName);
            if (!pluginInfo) return;
            pluginInfo.installStatus = plugin.installStatus;
        }
    }
}
</script>

<style>
.plugin-view {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--app-theme-surface);
}

.plugin-view .el-input {
    flex-shrink: 0;
}

.plugin-view .plugin-list {
    flex: 1;
    overflow-y: auto;
    background: var(--app-theme-surface);
}

.plugin-view :deep(.el-input-group__append),
.plugin-view :deep(.el-input__inner) {
    background: var(--app-theme-surface-elevated);
    color: var(--app-theme-text-primary);
    border-color: var(--app-theme-border);
}

</style>
