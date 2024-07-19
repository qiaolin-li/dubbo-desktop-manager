<template>
    <div class="plugin-content">
        <div class="plugin-header dragRegion notSelect">
            <div class="plugin-name">{{ plugin.name }}</div>
            <div class="plugin-info">
                <el-row>
                    <el-button size="mini"  v-if="plugin.installStatus === 'uninstalled'" @click="!plugin.ing && $emit('installPlugin', plugin)">{{ plugin.ing ? "安装中" : "安装" }}</el-button>
                    <el-button size="mini"  v-if="plugin.installStatus === 'update'"   @click="!plugin.ing && $emit('installPlugin', plugin)"  >{{ plugin.ing ? "更新中" : "更新到 "+ plugin.version }}</el-button>
                    <el-button size="mini"  v-if="(plugin.installStatus === 'installed' || plugin.installStatus === 'update')" @click="!plugin.ing && $emit('uninstallPlugin', plugin)" >{{ plugin.ing ? "卸载中" : "卸载" }}</el-button>
                </el-row>
                <el-link type="primary" class="plugin-home" @click="openHomepage(plugin.homepage)">插件主页</el-link>
            </div>
        </div>
        <mavon-editor class="plugin-desc" ref="md" :toolbars="markdownOption" defaultOpen="preview" :toolbarsFlag="false" :subfield="false"  :xssOptions="false" v-model="value"   />
    </div>
</template>

<script>
import pluginManager from "@/renderer/api/PluginManagerClient.js";
const remote = require("@electron/remote");
import axios from "axios";
import markdownItReplaceLink from 'markdown-it-replace-link'

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
    mounted(){
        const markdownIt = this.$refs.md.markdownIt;
        markdownIt.set({ breaks: false, linkify: false });
        var defaultRender = markdownIt.renderer.rules.link_open || function(tokens, idx, options, env, self) {
            return self.renderToken(tokens, idx, options);
        };
        markdownIt.renderer.rules.link_open = function (tokens, idx, options, env, self) {
            // If you are sure other plugins can't add `target` - drop check below
            var aIndex = tokens[idx].attrIndex('target');

            if (aIndex < 0) {
                tokens[idx].attrPush(['target', '_blank']); // add new attribute
            } else {
                tokens[idx].attrs[aIndex][1] = '_blank';    // replace value of existing attr
            }

            // pass token to default renderer.
            return defaultRender(tokens, idx, options, env, self);
        };
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
                    return 'D:\\projects\\ddm-plugin-dubbo-zookeeper-support\\logo.png';
                }
                return 'https://cdn.jsdelivr.net/npm/ddm-plugin-demo/' + link;
            }
        })

        var imagedefault = markdownIt.renderer.rules.image;
        markdownIt.renderer.rules.image = function(tokens, idx, options, env, slf){
            debugger
            return imagedefault(tokens, idx, options, env, slf);
        }
    },
    watch: {
        plugin: {
            deep: false,
            async handler(plugin) {
                try {
                   

                    let content;
                    if(plugin.source === 'local') {
                        content = await pluginManager.getReadMeFile(plugin);
                    } else {
                        const response = await axios.get(`https://cdn.jsdelivr.net/npm/${plugin.id}@${plugin.version}/README.md`);
                        content = response.data;
                    }

                    this.value = content;
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