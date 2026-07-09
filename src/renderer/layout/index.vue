<template>
    <div id="app">
        <app-titlebar @open-page="openPage" />
        <el-container class="app-body">
            <app-stage :main-panel="mainPanel" :open-page="openPage" />
        </el-container>
        <app-statusbar />
    </div>
</template>

<script>
import AppTitlebar                  from '@/renderer/layout/AppTitlebar.vue';
import AppStage                 from '@/renderer/layout/AppStage.vue';
import AppStatusbar                 from '@/renderer/layout/AppStatusbar.vue';
import pluginProvider               from '@/renderer/api/plugin/PluginProvider';
import { useLayoutStore }           from '@/renderer/store/modules/layout.js';

export default {
    components: {
        AppTitlebar,
        AppStage,
        AppStatusbar,
    },
    data() {
        return {
            layoutStore: useLayoutStore(),
        };
    },
    computed: {
        mainPanel() {
            return this;
        },
    },
    mounted() {
        pluginProvider.ensureBuiltinPlugins();
    },
    methods: {
        openPage(menu) {
            if (menu.id && this.layoutStore.currentPage.id === menu.id) {
                return;
            }

            if (menu.click) {
                menu.click(this);
                return;
            }

            this.layoutStore.openPage(menu);
        },
    },
};
</script>

<style>
.app-body {
    height: 100%;
    width: 100%;
    min-height: 0;
    overflow: hidden;
}
</style>
