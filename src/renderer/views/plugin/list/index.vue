<template>
    <el-tabs class="plugin-list-container" v-model="activeName">
        <el-tab-pane label="插件商店" name="store">
            <store @selectPlugin="(plugin) => $emit('selectPlugin', plugin)"></store>
        </el-tab-pane>
        <el-tab-pane label="已安装" name="installed">
            <installed @selectPlugin="(plugin) => $emit('selectPlugin', plugin)"></installed>
        </el-tab-pane>
        <el-tab-pane label="本地插件" name="development">
            <development @selectPlugin="(plugin) => $emit('selectPlugin', plugin)"></development>
        </el-tab-pane>
    </el-tabs>
</template>

<script>
import store                from './store.vue';
import installed            from './installed.vue';
import development          from './development.vue';
export default {
    components: {
        store   ,
        installed,
        development
    },
    data() {
        return {
            activeName: 'store'
        }
    },
    methods: {
    }
}
</script>

<style>
.plugin-list-container{
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--app-theme-surface);
}

.plugin-list-container .el-tabs__header{
    margin: 0px 0px 0px 5px ;
}
.plugin-list-container .el-tabs__content{
    height: 100%;
}

.plugin-list-container .el-tab-pane{
    height: 100%;
}

.plugin-list-container :deep(.el-tabs__nav-wrap::after) {
    background-color: var(--app-theme-border);
}

.plugin-list-container :deep(.el-tabs__item) {
    color: var(--app-theme-text-tertiary);
}

.plugin-list-container :deep(.el-tabs__item.is-active),
.plugin-list-container :deep(.el-tabs__item:hover) {
    color: var(--app-theme-text-primary);
}

</style>
