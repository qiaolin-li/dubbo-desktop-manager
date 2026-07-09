<template>
    <el-container class="app-workspace" direction="vertical">
        <el-main class="app-workspace_main">
            <!-- eslint-disable-next-line vue/require-component-is -->
            <component v-for="page in layoutStore.pageList" :key="page.id" v-bind="componentProps(page)" v-show="layoutStore.currentPage.id == page.id" />
            
            <!-- 用错误边界包裹，捕获插件组件渲染异常 -->
            <!-- <tab-error-boundary v-for="page in layoutStore.pageList"  v-show="layoutStore.currentPage.id == page.id" :key="page.id" :label="page.label" @retry="forceUpdateComponent(page)"> -->
            <!-- eslint-disable-next-line vue/require-component-is -->
                <!-- <component  v-bind="componentProps(page)" />
            </tab-error-boundary> -->
        </el-main>
        <workbenchPanel></workbenchPanel>
    </el-container>
</template>

<script>
import workbenchPanel               from '@/renderer/layout/AppWorkbench.vue';
import { useLayoutStore }           from '@/renderer/store/modules/layout.js';
import TabErrorBoundary             from "@/renderer/components/TabErrorBoundary.js";

export default {
    components: {
        workbenchPanel,
        TabErrorBoundary,
    },
    props: {
        mainPanel: {
            type: Object,
            required: true,
        },
        openPage: {
            type: Function,
        }
    },
    data() {
        return {
            layoutStore: useLayoutStore(),
        };
    },
    methods: {
        componentProps(page) {
            if (page.component) {
                return {
                    is: page.component,
                    ...page.params,
                    mainPanel: this.mainPanel,
                    switchCurrentPage: () => this.$emit('open-page', page),
                    switchCurrentMenu: () => this.$emit('open-page', page),
                };
            }

            return {
                target: '_blank',
                rel: 'noopener',
                is: 'iframe',
                src: page.src,
                height: '100%',
                width: '100%',
                style: 'vertical-align:top'
            };
        },
    },
};
</script>

<style>
.app-workspace {
    flex: 1 1 auto;
    width: auto;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

.app-workspace_main {
    flex: 1;
    padding: 0 !important;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
}
</style>
