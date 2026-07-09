<template>
    <app-log-view ref="logConsole" class="app-log"></app-log-view>
</template>

<script>
import { appIpc }                   from "@/renderer/core/AppRenderer";
import AppLogView                   from "@/renderer/components/editor/log-view.vue";

export default {
    components: {
        AppLogView,
    },
    data() {
        return {};
    },
    mounted() {
        this.appListenerCloseFun = appIpc.on("applicationLog", this.logListener);
        this.pluginListenerCloseFun = appIpc.on("pluginOperationLog", this.logListener);
    },
    methods: {
        refresh() {
            if (this.$refs.logConsole && this.$refs.logConsole.focus) {
                this.$refs.logConsole.focus();
            }
        },
        fit() {
            this.$refs.terminal.fit();
        },
        logListener(message) {
            this.$refs.logConsole.appendLog(message);
        },
    },
    destroyed() {
        this.appListenerCloseFun();
        this.pluginListenerCloseFun();
    },
};
</script>

<style>
.app-log {
    height: 100%;
    width: 100%;
}

.pane > .header {
    height: 20px !important;
    padding: 5px !important;
}

.pane > .content {
    padding: 0px !important;
}
</style>
