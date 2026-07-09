<template>
    <div class="plugin-discovery">
        <app-split-pane @resize="resize" split="vertical" :min-percent="20" :default-percent="30">
            <template slot="paneL">
                <div
                    v-for="plugin in localPluginList"
                    :key="plugin.pluginId"
                    class="plugin-discovery__item"
                    :class="{ active: currentPlugin && currentPlugin.pluginName === plugin.pluginName }"
                >
                    <div
                        v-if="showInstallProgress"
                        class="plugin-discovery__item-progress"
                        :class="plugin.installState"
                        :style="{ width: `${getPluginProgress(plugin)}%` }"
                    ></div>
                    <pluginItem
                        :plugin="plugin"
                        :showDownloads="!showInstallProgress"
                        :showDefaultStatus="!showInstallProgress"
                        @selectPlugin="(plugin) => currentPlugin = plugin"
                    >
                        <span v-if="showInstallProgress" class="plugin-discovery__item-status" :class="plugin.installState">
                            <i v-if="plugin.installState === 'installing'" class="el-icon-loading plugin-item__meta-icon"></i>
                            <i v-else-if="plugin.installState === 'success'" class="el-icon-success plugin-item__meta-icon"></i>
                            <i v-else-if="plugin.installState === 'error'" class="el-icon-warning-outline plugin-item__meta-icon"></i>
                            <i v-else class="el-icon-time plugin-item__meta-icon"></i>
                            {{ getPluginStatusText(plugin) }}
                        </span>
                    </pluginItem>
                </div>
            </template>
            <template slot="paneR">
                <pluginDetails v-if="currentPlugin" class="plugin-discovery__content" :plugin="currentPlugin" :allowUninstall="false" :showVersionSelect="!autoInstall" :showActions="!autoInstall" @installPlugin="installPlugin"></pluginDetails>
            </template>
        </app-split-pane>
    </div>
</template>

<script>

import pluginManager                     from "@/renderer/api/PluginManagerClient.js";
import pluginProvider                    from "@/renderer/api/plugin/PluginProvider";
import appRenderer, { appWindow }        from '@/renderer/core/AppRenderer.js';
import pluginItem                        from '@/renderer/views/plugin/list/pluginItem.vue';
import pluginDetails                     from "@/renderer/views/plugin/details.vue";
import { useLayoutStore }                from '@/renderer/store/modules/layout.js';

export default {
    components: { 
        pluginItem, 
        pluginDetails 
    },
    data() {
        return {
            currentPlugin: null,
            installing: false,
            finished: false,
            hasError: false,
            layoutStore: useLayoutStore(),
            localPluginList: this.pluginList.map((plugin) => ({
                installState: 'pending',
                ...plugin
            }))
        }
    },
    props: {
        dialog: Object,
        pluginList: {
            type: Array,
            default: () => []
        },
        autoInstall: {
            type: Boolean,
            default: false
        },
        requireRestartAfterInstall: {
            type: Boolean,
            default: false
        },
        lockDialogWhileInstalling: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        showInstallProgress() {
            return this.autoInstall;
        }
    },
    async mounted() {
        if (!this.localPluginList || this.localPluginList.length === 0) {
            return;
        }

        this.currentPlugin = this.localPluginList[0];

        if (this.autoInstall) {
            await this.loadPluginInfo();
            this.installBuiltinPlugins();
        }
    },
    methods: {
        resize() {},
        dialogActions() {
            if (this.autoInstall) {
                return [];
            }

            return [
                {
                    text: this.$t('plugin.installAll'),
                    type: 'primary',
                    handler: async () => {
                        await Promise.all(this.localPluginList.map(async plugin => {
                            if(plugin.installStatus !== 'installed'){
                                await this.installPlugin(plugin);
                            }
                        }))

                        return true;
                    },
                }
            ];
        },
        async loadPluginInfo() {
            await Promise.allSettled(this.localPluginList.map(async (plugin) => {
                if (plugin.description && plugin.author && plugin.logo) {
                    return;
                }

                try {
                    const pluginInfo = await pluginProvider.getPlugin(plugin.pluginName);
                    Object.assign(plugin, {
                        pluginNickName: pluginInfo.pluginNickName || plugin.pluginNickName,
                        author: pluginInfo.author || plugin.author,
                        description: pluginInfo.description || plugin.description,
                        logo: pluginInfo.logo,
                        logoLoadSuccess: !!pluginInfo.logo,
                        homepage: pluginInfo.homepage,
                    });
                } catch (error) {
                    console.error(`load plugin info error: ${plugin.pluginName}`, error);
                }
            }));
        },
        async installPlugin(plugin) {
            try {
                this.layoutStore.showWorkbench();
                plugin.ing = true;
                await pluginManager.install(plugin)

                this.$message({
                    type: "success",
                    message: this.$t('plugin.installSuccess', {
                        name: plugin.pluginNickName,
                        version: plugin.version,
                    }),
                });
                plugin.installStatus = 'installed';
                appRenderer.emit("plugin-installed", plugin);
            } finally {
                plugin.ing = false;
            }
        },
        getPluginStatusText(plugin) {
            if (plugin.installState === 'installing') {
                return this.$t('plugin.installing');
            }

            if (plugin.installState === 'success') {
                return this.$t('plugin.installed');
            }

            if (plugin.installState === 'error') {
                return this.$t('plugin.installFailed');
            }

            return plugin.installStatus === 'update'
                ? this.$t('plugin.waitingForUpdate')
                : this.$t('plugin.waitingForInstall');
        },
        getPluginProgress(plugin) {
            if (plugin.installState === 'success' || plugin.installState === 'error') {
                return 100;
            }

            if (plugin.installState === 'installing') {
                return 78;
            }

            return 0;
        },
        async installBuiltinPlugins() {
            this.installing = true;

            for (const plugin of this.localPluginList) {
                this.currentPlugin = plugin;
                plugin.installState = 'installing';
                plugin.ing = true;

                try {
                    await pluginManager.install({
                        pluginId: plugin.pluginId,
                        pluginName: plugin.pluginName,
                        version: plugin.targetVersion || plugin.version
                    });
                    plugin.installState = 'success';
                    plugin.installStatus = 'installed';
                    plugin.ing = false;
                    appRenderer.emit("plugin-installed", plugin);
                } catch (error) {
                    plugin.installState = 'error';
                    plugin.ing = false;
                    plugin.errorMessage = error.message || `${error}`;
                    this.hasError = true;
                    console.error(`install builtin plugin error: ${plugin.pluginName}`, error);
                }
            }

            this.installing = false;
            this.finished = true;

            if (this.requireRestartAfterInstall && !this.hasError) {
                await this.confirmRestart();
                return;
            }

            if (this.hasError) {
                if (this.dialog && typeof this.dialog.update === 'function') {
                    this.dialog.update({
                        disableClose: false,
                        closeOnEsc: true
                    });
                }
                this.$message.error(this.$t('plugin.builtinInstallFailedMessage'));
            }
        },
        async confirmRestart() {
            try {
                await this.$confirm(
                    this.$t('plugin.restartConfirmMessage'),
                    this.$t('plugin.restartConfirmTitle'),
                    {
                        confirmButtonText: this.$t('plugin.restartNow'),
                        cancelButtonText: this.$t('plugin.restartLater'),
                        closeOnClickModal: false,
                        type: 'warning'
                    }
                );

                appWindow.restart();
            } catch (error) {
                this.dialog && this.dialog.close && this.dialog.close({ restarted: false });
            }
        },
        dialogCancel() {
            if (this.lockDialogWhileInstalling && this.installing) {
                this.$message.warning(this.$t('plugin.installingWaitMessage'));
                return false;
            }

            return true;
        }
    }
}
</script>

<style>
.plugin-discovery {
    height: 72vh;
    min-height: 420px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--app-theme-surface);
}

.plugin-discovery /deep/ .vue-splitter-container {
    height: 100%;
}

.plugin-discovery /deep/ .splitter-pane {
    height: 100%;
    overflow: hidden;
}

.plugin-discovery /deep/ .splitter-paneL {
    border-right: 1px solid var(--app-theme-border);
}

.plugin-discovery /deep/ .drag-tab-item {
    height: 100%;
}

.plugin-discovery /deep/ .plugin-discovery__content {
    height: 100%;
}

.plugin-discovery__item {
    position: relative;
    overflow: hidden;
}

.plugin-discovery__item.active {
    background: var(--app-theme-active-background);
}

.plugin-discovery__item-progress {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 0;
    background: var(--app-theme-accent-soft);
    transition: width .2s ease;
    pointer-events: none;
    z-index: 0;
}

.plugin-discovery__item-progress.installing {
    background: var(--app-theme-accent-soft);
}

.plugin-discovery__item-progress.success {
    background: var(--app-theme-success-soft);
}

.plugin-discovery__item-progress.error {
    background: var(--app-theme-danger-soft);
}

.plugin-discovery__item /deep/ .plugin-item {
    position: relative;
    z-index: 1;
    background: transparent;
}

.plugin-discovery__item-status {
    display: inline-flex;
    align-items: center;
    height: 18px;
    padding: 0 6px;
    border-radius: 3px;
    background: var(--app-theme-surface-elevated);
    color: var(--app-theme-text-primary);
    font-size: 12px;
    line-height: 18px;
    font-weight: 500;
}

.plugin-discovery__item-status.installing {
    background: var(--app-theme-accent-soft);
    color: var(--app-theme-accent);
}

.plugin-discovery__item-status.success {
    background: var(--app-theme-success-soft);
    color: var(--app-theme-success);
}

.plugin-discovery__item-status.error {
    background: var(--app-theme-danger-soft);
    color: var(--app-theme-danger);
}
</style>
