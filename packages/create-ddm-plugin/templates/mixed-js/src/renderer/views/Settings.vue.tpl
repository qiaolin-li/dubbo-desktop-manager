<template>
    <div class="ddm-plugin-settings">
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <p>{{ $pluginT('title') }}</p>
        <el-button size="mini" type="primary" @click="loadMessage">调用主进程服务</el-button>
    </div>
</template>

<script>
import appView from 'appView';

const helloService = appView.referenceService('helloService');

export default {
    name: 'PluginSettings',
    data() {
        return {
            title: '__PLUGIN_TITLE__',
            message: 'Ready',
        };
    },
    methods: {
        async loadMessage() {
            const result = await helloService.sayHello(this.title);
            this.message = result.message;
        },
    },
};
</script>

<style scoped>
.ddm-plugin-settings {
    padding: 12px;
}
</style>
