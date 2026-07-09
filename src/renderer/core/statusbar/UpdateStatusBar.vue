<template>
    <transition name="update-slide">
        <div class="app-updater">
            <!-- 固定头部 -->
            <div class="app-updater__header">
                <p class="app-updater__title">新版本可用 🎉🎉🎉</p>
                <div class="app-updater__version-row">
                    <span class="app-updater__label">当前版本</span>
                    <span class="app-updater__ver-tag">{{ currentVersion }}</span>
                    <span class="app-updater__arrow">→</span>
                    <span class="app-updater__label">最新版本</span>
                    <span class="app-updater__ver-tag app-updater__ver-tag--new">{{ newVersion }}</span>
                </div>
            </div>

            <!-- 滚动区域 -->
            <div class="app-updater__body"  v-if="parsedReleaseBody">
                <!-- <p class="app-updater__notes-label">更新内容 🎁🎁🎁</p> -->
                <mavon-editor class="app-updater__release-body" ref="md" :toolbars="markdownOption" defaultOpen="preview" :toolbarsFlag="false"
                    :subfield="false" :xssOptions="false" v-model="parsedReleaseBody" :imageClick="() => false"/>
            </div>

            <!-- 固定底部 -->
            <div class="app-updater__footer">
                <el-row>
                    <el-button type="primary" size="mini" @click="handleMainAction">立即下载</el-button>
                    <el-button size="mini" @click="skipCurrentVersion">跳过当前版本</el-button>
                </el-row>
            </div>
        </div>
    </transition>
</template>

<script>
// import markdownItReplaceLink    from 'markdown-it-replace-link'
import { appConfig, appShell }              from '@/renderer/core/AppRenderer.js';

export default {
    name: 'AppUpdater',

    props: {
        currentVersion: {
            type: String,
            require: true,
        },
        newVersion: {
            type: String,
            require: true,
        },
        releaseBody: {
            type: String,
            require: true,
        },
        downloadUrl: {
            type: String,
            require: true,
        },
        item: {
            type: Object,
            require: true,
        },
    },

    data() {
        return {
            parsedReleaseBody: this.releaseBody,
            downloading: false,
            downloaded: false,
            progress: 0,
            markdownOption: {
                bold: true,
                navigation: true,
            },
        }
    },

    mounted() {
    },

    methods: {
        async handleMainAction() {
            appShell.openExternal(this.downloadUrl)
        },
        skipCurrentVersion() {
            const key = `updateManager.skip-version-${this.newVersion.replace(/\./g, '-')}`;
            appConfig.setProperty(key, true);
            this.item.dispose();
        }
    }
}
</script>

<style scoped>
.app-updater {
    background: var(--color-bg, #fff);
    display: flex;
    flex-direction: column;
    gap: 6px;
    height:100%;
    justify-content: space-between;
}

.app-updater__header {
    flex-shrink: 0;  /* 不压缩 */
}
.app-updater__title {
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text-primary, #303133);
}

.app-updater__body {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

.app-updater__notes-label {
    font-size: 16px;
    font-weight: 500;
    color: var(--color-text-primary, #303133);
}

.app-updater__release-body {
    height: 100%;
}

.app-updater__footer {
    display: flex;
    justify-content: space-evenly;
    padding-top: 12px;
    border-top: 1px solid #ebeef5;
}

</style>