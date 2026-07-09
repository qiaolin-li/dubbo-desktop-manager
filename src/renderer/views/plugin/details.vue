<template>
    <div class="plugin-details">
        <div class="plugin-details__header notSelect">
            <div class="plugin-details__info">
                <div class="plugin-details__base-info">
                    <div class="plugin-details__name">{{ plugin.pluginNickName }}</div>
                    <el-select class="plugin-details__version-select" v-if="showVersionSelect && plugin.source !== 'local'" v-model="version" @change="changePluginVersion" filterable value-key="version" size="mini">
                        <el-option v-for="versionInfo in versions" :key="versionInfo.version" :label="versionInfo.version" :value="versionInfo"></el-option>
                    </el-select>
                    <el-row v-if="showActions" class="plugin-details__action-row">
                        <el-button size="mini"  v-if="isVersionCompatible(version) && (plugin.installStatus === 'uninstalled' || !allowUninstall)" @click="!plugin.ing && $emit('installPlugin', plugin)">{{ plugin.ing ? $t('plugin.installing') : $t('plugin.install') }}</el-button>
                        <el-button size="mini"  v-if="isVersionCompatible(version) && plugin.installStatus === 'update'"   @click="!plugin.ing && $emit('installPlugin', plugin)"  >{{ plugin.ing ? $t('plugin.updating') : `${$t('plugin.updateTo')} ${plugin.version}` }}</el-button>
                        <el-button size="mini"  v-if="(plugin.installStatus === 'installed'  || plugin.installStatus === 'update') &&  allowUninstall" @click="!plugin.ing && $emit('uninstallPlugin', plugin)" >{{ plugin.ing ? $t('plugin.uninstalling') : $t('plugin.uninstall') }}</el-button>
                    </el-row>
                </div>
                <div class="plugin-details__base-info">
                    <div class="plugin-details__author">{{ $t('plugin.author') }}: {{ plugin.author }}</div>
                    <el-link type="success" class="plugin-details__home-link" @click="openHomepage('https://www.npmjs.com/package/' + plugin.pluginName)">{{ $t('plugin.repository') }}</el-link>
                    <el-link type="primary" class="plugin-details__home-link" v-if="plugin.homepage" @click="openHomepage(plugin.homepage)">{{ $t('plugin.homepage') }}</el-link>
                </div>
            </div>
            <div class="plugin-details__error-message" v-if="!isVersionCompatible(version)">
                <el-link v-if="!version.engines" type="danger" :underline="false">{{ $t('plugin.incompatibleWithoutEngines') }}</el-link>
                <el-link v-else type="danger" :underline="false">{{ $t('plugin.incompatibleWithClientVersion', { current: currentClientVersion(), required: version.engines['ddm'] }) }}</el-link>
            </div>
        </div>
        <mavon-editor class="plugin-details__desc" ref="md" :toolbars="markdownOption" defaultOpen="preview" :toolbarsFlag="false" 
                    :subfield="false"  :xssOptions="false" v-model="value"    :imageClick="() => false"  />
    </div>
</template>

<script>

import axios                            from "axios";
import { satisfies }                    from 'semver';
import markdownItReplaceLink            from 'markdown-it-replace-link'

import pluginProvider                   from "@/renderer/api/plugin/PluginProvider";
import { appShell }                     from '@/renderer/core/AppRenderer.js';

export default {
    name: "pluginDetails",
    props: {
        plugin: Object,
        allowUninstall: {
            type: Boolean,
            default: true
        },
        showVersionSelect: {
            type: Boolean,
            default: true
        },
        showActions: {
            type: Boolean,
            default: true
        },
    },
    data() {
        return {
            value: '',
            markdownOption: {
                bold: true,
                navigation: true,
            },
            version: {},
            versions: [],
        };
    },
    async mounted(){
        await this.$nextTick();
        this.initMarkdownIt();

        await this.loadPluginVersionList();
        this.changePlugin();
    },
    watch: {
        'plugin.pluginName': {
            async handler() {
                await this.loadPluginVersionList();
                this.changePlugin();
            },
            immediate: false,
        }
    },
    methods: {
        initMarkdownIt() {
            const markdownEditor = this.$refs.md;
            if (!markdownEditor || !markdownEditor.markdownIt) {
                return;
            }

            const markdownIt = markdownEditor.markdownIt;
            markdownIt.set({ breaks: false, linkify: false });
            markdownIt.use(markdownItReplaceLink, {
                processHTML: true,
                replaceLink: (link, env, token, htmlToken) => {
                    if(htmlToken && htmlToken.name === 'a'){
                        htmlToken.attribs.target = '_blank'
                    }
                    try {
                        new URL(link);
                        return link; 
                    } catch (e) {
                        // ignore
                    }

                    if(this.plugin.source === 'local'){
                        return 'file:' + this.plugin.path + "/" + link;
                    }
                    return `https://cdn.jsdelivr.net/npm/${this.plugin.pluginName}@${this.version.version}/` + link;
                }
            });
        },
        currentClientVersion() {
            return window.constant.VERSION;
        },
        isVersionCompatible(version) {
            if (!version) return true;
            if (!version.engines) return false;
            try {
                return satisfies(window.constant.VERSION, version.engines['ddm']);
            } catch {
                return false;
            }
        },
        async loadPluginVersionList(){
            if(this.plugin.source === 'local') {
                this.versions = this.plugin.versions;
                this.version = this.plugin.versions[0];
                return;
            }
            try {
                const pluginInfo = await pluginProvider.getPlugin(this.plugin.pluginName);
                
                this.versions = pluginInfo.versions;

                const versionInfo = pluginInfo.versions.find(versionInfo => this.isVersionCompatible(versionInfo));
                this.version = versionInfo || pluginInfo.versions[0];
                this.plugin.homepage = pluginInfo.homepage;
            } catch(err) {
                console.error(this.$t('plugin.loadVersionListFailed'), err);
            }
        },
        async changePluginVersion(version){
            this.version = version;
            this.plugin.version = version.version;
            this.changePlugin();
        },
        async changePlugin(){
            try {
                if(this.plugin.source === 'local') {
                    const response = await axios.get(this.plugin.readme);
                    this.value = response.data;
                } else {
                    const response = await axios.get(`https://cdn.jsdelivr.net/npm/${this.plugin.pluginName}@${this.version.version}/README.md`);
                    this.value = response.data;
                }
            } catch(err) {
                this.value = this.plugin.description;
            }
        },
        openHomepage(url) {
            if (url) appShell.openExternal(url);
        },
    },
};
</script>

<style>

.plugin-details__header {
    padding: 14px 16px 12px;
    border-bottom: 1px solid var(--app-theme-border);
    color: var(--app-theme-text-primary);
    background: var(--app-theme-surface);
}

.plugin-details__info {
    display: flex;
    align-items: center;
    align-content: center;
    justify-content: space-between;
    margin-bottom: 8px;
    gap: 12px;
    flex-wrap: wrap;
}

.plugin-details__base-info {
    display: flex;
    align-items: center;
    align-content: space-between;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
}

.plugin-details__base-info:last-child {
    gap: 12px;
}

.plugin-details__info .el-select{
    width: 150px;
}

.plugin-details__error-message {
    display: flex;
    justify-content: space-between;
}

.plugin-details__name {
    font-size: 26px;
    line-height: 32px;
    min-height: 32px;
    font-weight: 700;
    color: var(--app-theme-text-primary);
}

.plugin-details__author {
    color: var(--app-theme-text-secondary);
    font-size: 13px;
    font-weight: 500;
    padding: 0 2px;
    line-height: 24px;
}

.plugin-details__home-link {
    display: inline-flex;
    align-items: center;
    height: 24px;
    padding: 0 8px;
    border-radius: 4px;
    font-weight: 500;
    color: var(--app-theme-text-primary) !important;
    background: var(--app-theme-surface-elevated);
}

.plugin-details__home-link.el-link + .plugin-details__home-link.el-link {
    margin-left: 0;
}

.plugin-details__home-link:hover {
    background: var(--app-theme-hover-background);
}

.plugin-details__action-row {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.plugin-details__action-row /deep/ .el-button {
    min-width: 64px;
}

.plugin-details__version-select /deep/ .el-input__inner {
    border-radius: 4px;
}

.plugin-details {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--app-theme-surface);
}

.plugin-details__desc {
    flex: 1;
    overflow-y: auto;
}

.hljs {
    background-color: var(--app-theme-surface-elevated);
}

.v-note-wrapper {
    z-index: 0 !important;
}

.plugin-details :deep(.el-input__inner),
.plugin-details :deep(.el-select .el-input__inner) {
    background: var(--app-theme-surface-elevated);
    color: var(--app-theme-text-primary);
    border-color: var(--app-theme-border);
}

.plugin-details :deep(.v-note-wrapper),
.plugin-details :deep(.v-note-panel),
.plugin-details :deep(.v-note-show),
.plugin-details :deep(.v-show-content),
.plugin-details :deep(.v-show-content-html) {
    background: var(--app-theme-surface) !important;
    color: var(--app-theme-text-primary) !important;
}

.plugin-details :deep(.v-show-content),
.plugin-details :deep(.v-show-content-html),
.plugin-details :deep(.v-show-content p),
.plugin-details :deep(.v-show-content li),
.plugin-details :deep(.v-show-content blockquote),
.plugin-details :deep(.v-show-content table),
.plugin-details :deep(.v-show-content tr),
.plugin-details :deep(.v-show-content td),
.plugin-details :deep(.v-show-content th) {
    color: var(--app-theme-text-primary) !important;
}

.plugin-details :deep(.v-show-content a) {
    color: var(--app-theme-accent) !important;
}

.plugin-details :deep(.v-show-content hr),
.plugin-details :deep(.v-show-content table th),
.plugin-details :deep(.v-show-content table td),
.plugin-details :deep(.v-show-content blockquote) {
    border-color: var(--app-theme-border) !important;
}

.plugin-details :deep(.v-show-content pre),
.plugin-details :deep(.v-show-content code),
.plugin-details :deep(.v-show-content pre code) {
    background: var(--app-theme-surface-elevated) !important;
    color: var(--app-theme-text-primary) !important;
}

.plugin-details :deep(.v-show-content blockquote) {
    background: color-mix(in srgb, var(--app-theme-surface-elevated) 78%, transparent) !important;
}

.plugin-details :deep(.v-show-content table tr:nth-child(2n)),
.plugin-details :deep(.v-show-content table thead tr) {
    background: color-mix(in srgb, var(--app-theme-surface-elevated) 72%, transparent) !important;
}

.plugin-details :deep(.v-note-op),
.plugin-details :deep(.v-note-panel) {
    box-shadow: none !important;
}
</style>
