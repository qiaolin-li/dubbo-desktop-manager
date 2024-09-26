<template>
    <div class="plugin-content">
        <div class="plugin-header dragRegion notSelect">
            <div class="plugin-name">{{ plugin.name }}</div>
            <div class="plugin-info">
                <el-row>
                    <el-button size="mini"  v-if="plugin.installStatus === 'uninstalled' || !allowUninstall" @click="!plugin.ing && $emit('installPlugin', plugin)">{{ plugin.ing ? "安装中" : "安装" }}</el-button>
                    <el-button size="mini"  v-if="plugin.installStatus === 'update'"   @click="!plugin.ing && $emit('installPlugin', plugin)"  >{{ plugin.ing ? "更新中" : "更新到 "+ plugin.version }}</el-button>
                    <el-button size="mini"  v-if="(plugin.installStatus === 'installed'  || plugin.installStatus === 'update') &&  allowUninstall" @click="!plugin.ing && $emit('uninstallPlugin', plugin)" >{{ plugin.ing ? "卸载中" : "卸载" }}</el-button>
                </el-row>
                <el-link type="primary" class="plugin-home" @click="openHomepage(plugin.homepage)">插件主页</el-link>
            </div>
        </div>
        <mavon-editor class="plugin-desc" ref="md" :toolbars="markdownOption" defaultOpen="preview" :toolbarsFlag="false" :subfield="false"  :xssOptions="false" v-model="value"   />
    </div>
</template>

<script>
const remote =                  require("@electron/remote");
import axios                    from "axios";
import markdownItReplaceLink    from 'markdown-it-replace-link'

export default {
    name: "pluginDetails",
    props: {
        plugin: Object,
        allowUninstall: {
            type: Boolean,
            default: true
        },
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
    mounted(){
        const markdownIt = this.$refs.md.markdownIt;
        markdownIt.set({ breaks: false, linkify: false });
        markdownIt.use(markdownItReplaceLink, {
            processHTML: true, // defaults to false for backwards compatibility
            replaceLink: (link, env, token, htmlToken) => {
                if(htmlToken && htmlToken.name === 'a'){
                    htmlToken.attribs.target = '_blank'
                }
                try {
                    // 如果能成功解析为 URL，则不是相对路径
                    new URL(link);
                    return link; 
                } catch (e) {
                    // 忽略
                }

                if(this.plugin.source === 'local'){
                    return 'file:' + this.plugin.path + "/" + link;
                }
                return 'https://cdn.jsdelivr.net/npm/ddm-plugin-demo/' + link;
            }
        })

        this.changePlugin();
    },
    watch: {
        plugin: {
            deep: false,
            async handler() {
                this.changePlugin();
            },
        }
    },
    methods: {
        async changePlugin(){
            try {
                let content;
                if(this.plugin.source === 'local') {
                    const response = await axios.get(this.plugin.readme);
                    content = response.data;
                } else {
                    const response = await axios.get(`https://cdn.jsdelivr.net/npm/${this.plugin.id}@${this.plugin.version}/README.md`);
                    content = response.data;
                }

                this.value = content;
            } catch(err) {
                this.value = this.plugin.description;
            }
        },
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