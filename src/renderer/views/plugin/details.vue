<template>
    <div class="plugin-content" :class="{ disabled: !plugin.enabled }">
        <div class="plugin-header dragRegion notSelect">
            <div class="plugin-name">{{ plugin.name }}</div>
            <div class="plugin-info">
                <el-row>
                    <el-button size="mini"  v-if="plugin.installStatus === 'uninstalled'" @click="!plugin.ing && $emit('installPlugin', plugin)">{{ plugin.ing ? "安装中" : "安装" }}</el-button>
                    <el-button size="mini"  v-if="plugin.installStatus === 'update'"   @click="!plugin.ing && $emit('installPlugin', plugin)"  >{{ plugin.ing ? "更新中" : "更新到 "+ plugin.version }}</el-button>
                    <el-button size="mini"  v-if="(plugin.installStatus === 'installed' || plugin.installStatus === 'update')" @click="!plugin.ing && $emit('uninstallPlugin', plugin)" >{{ plugin.ing ? "卸载中" : "卸载" }}</el-button>
                </el-row>
                <el-link type="primary" class="plugin-home" @click="openHomepage(plugin.homepage)">插件主页</el-link>
                <!-- <span class="plugin-author">{{ plugin.author }}</span> -->
            </div>
                <!-- <span class="config-button ing" v-if="plugin.hasInstall && !plugin.ing" > 已安装 </span>
                <span class="config-button install" v-if="!plugin.hasInstall && !plugin.ing" @click="$emit('installPlugin', plugin)">安装</span>
                <span class="config-button install" v-if="plugin.hasInstall && !plugin.ing" @click="$emit('uninstallPlugin', plugin)">卸载</span>
                <span v-if="!plugin.hasInstall && plugin.ing" class="config-button ing">安装中</span>
                <div>
                    <i v-if="plugin.enabled" class="el-icon-setting" @click="buildContextMenu(plugin)"></i>
                    <i v-else class="el-icon-remove-outline" @click="buildContextMenu(plugin)"></i>
                </div> -->

            <el-row>
            </el-row>
        </div>
        <mavon-editor class="plugin-desc" ref="md" :toolbars="markdownOption" defaultOpen="preview" :toolbarsFlag="false" :subfield="false" v-model="value"   />
    </div>
</template>

<script>
const remote = require("@electron/remote");
import axios from "axios";

export default {
    name: "pluginDetails",
    props: {
        plugin: Object,
    },
    data() {
        return {
            value: '',
            markdownOption: {
                bold: true, // 粗体
                navigation: true, // 导航目录

            },
        };
    },
    watch: {
        plugin: {
            deep: false,
            async handler(plugin) {
                try {
                    const response = await axios.get(`https://cdn.jsdelivr.net/npm/${plugin.id}@${plugin.version}/README.md`);
                    this.value = response.data;
                    const markdownIt = this.$refs.md.markdownIt;
                    markdownIt.set({ breaks: false });
                } catch(err) {
                    this.value = plugin.description;
                }
            },
        }
    },
    methods: {
        openHomepage(url) {
            if (url) remote.shell.openExternal(url);
        },
    },
};
</script>

<style>

.plugin-header {
    padding: 10px;
}

.plugin-info {
    display: flex;
    justify-content: space-between;
}

.plugin-name {
    font-size: 25px;
    line-height: 30px;
    height: 30px;
    margin-bottom: 10px;
    font-weight: bold;
}

.plugin-content {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.plugin-desc {
    height: 100%;
    overflow: auto;
}

.hljs {
    background-color: #f6f8fa;
}

.v-note-wrapper {
    z-index: 0 !important;

}
</style>