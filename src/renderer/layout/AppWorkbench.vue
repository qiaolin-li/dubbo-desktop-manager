<template>
    <div class="workbench-panel" :class="panelClass" :style="panelStyle" @mousedown="startHiddenResize">
        <div v-show="!hidden" class="workbench-panel-header" @mousedown.stop="startResize">
            <el-tabs v-model="activePanelId" class="workbench-panel-tabs" @tab-click="handleTabClick">
                <el-tab-pane v-for="panel in panelList" :key="panel.id" :label="$t(panel.titleKey)" :name="panel.id">
                </el-tab-pane>
            </el-tabs>

            <div class="workbench-panel-actions">
                <button class="workbench-panel-action-btn" :title="maximized ? $t('workbench.exitMaximized') : $t('workbench.maximize')" @click.stop="toggleMaximized">
                    <i :class="maximized ? 'el-icon-copy-document' : 'el-icon-full-screen'"></i>
                </button>
                <button class="workbench-panel-action-btn" :title="$t('workbench.hide')" @click.stop="hidePanel">
                    <i class="el-icon-close"></i>
                </button>
            </div>
        </div>

        <div v-show="!hidden" class="workbench-panel-body">
            <component :is="currentPanel.component" ref="activePanel" class="workbench-panel-content" />
        </div>
    </div>
</template>

<script>
import pluginLog                            from "@/renderer/layout/AppLog.vue";
import { useLayoutStore }                   from "@/renderer/store/modules/layout.js";

export default {
    components: {
        pluginLog,
    },
    data() {
        return {
            layoutStore: useLayoutStore(),
            maximized: false,
            panelHeight: 220,
            resizeState: null, // 存储拖拽起始状态
            activePanelId: "pluginLog",
            panelList: [
                {
                    id: "pluginLog",
                    titleKey: "workbench.logs",
                    component: "pluginLog",
                },
            ],
        };
    },
    computed: {
        currentPanel() {
            return (
                this.panelList.find(
                    (panel) => panel.id === this.activePanelId
                ) || this.panelList[0]
            );
        },
        hidden() {
            return !this.layoutStore.workbenchVisible;
        },
        panelClass() {
            return {
                "workbench-panel-hidden": this.hidden,
                "workbench-panel-maximized": this.maximized,
                "is-resizing": !!this.resizeState, // 拖拽中状态
            };
        },
        panelStyle() {
            // 拖拽时禁用 transition，否则会有“延迟追随”的卡顿感
            const transition = this.resizeState
                ? "none"
                : "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)";

            const baseStyle = {
                transition,
                position: "relative",
                overflow: "hidden",
            };

            if (this.hidden) {
                return {
                    ...baseStyle,
                    height: "1px", // 留出一点空间显示阴影
                    borderTop: "none",
                    background: "transparent",
                    boxShadow: "inset 0 1px 0 0 var(--app-theme-border)", // 使用主题边框色，避免残留亮蓝拖动线
                    cursor: "ns-resize",
                };
            }

            if (this.maximized) {
                return {
                    ...baseStyle,
                    height: "100%",
                };
            }

            return {
                ...baseStyle,
                height: `${this.panelHeight}px`,
            };
        },
    },
    mounted() {
        window.addEventListener("mousemove", this.handleResize);
        window.addEventListener("mouseup", this.stopResize);
    },
    beforeDestroy() {
        window.removeEventListener("mousemove", this.handleResize);
        window.removeEventListener("mouseup", this.stopResize);
    },
    methods: {
        handleTabClick() {},
        toggleMaximized() {
            this.layoutStore.showWorkbench();
            this.maximized = !this.maximized;
            this.refreshActivePanel();
        },
        hidePanel() {
            this.layoutStore.hideWorkbench();
            this.maximized = false;
        },
        showPanel() {
            this.layoutStore.showWorkbench();
            if (!this.panelHeight || this.panelHeight < 120) {
                this.panelHeight = 220;
            }
            this.refreshActivePanel();
        },
        // 开始调整高度
        startResize(event) {
            this.resizeState = {
                startY: event.clientY,
                startHeight: this.hidden ? 0 : this.panelHeight,
            };
            document.body.style.cursor = "ns-resize"; // 强制全局鼠标样式
            event.preventDefault();
        },
        // 隐藏状态下点击或拖拽边缘
        startHiddenResize(event) {
            if (!this.hidden) return;
            this.startResize(event);
        },
        handleResize(event) {
            if (!this.resizeState) return;

            // 使用 requestAnimationFrame 优化渲染性能
            window.requestAnimationFrame(() => {
                if (!this.resizeState) return;

                // 计算高度：起始高度 + (起始位置 - 当前位置) -> 向上拖动高度增加
                const deltaY = this.resizeState.startY - event.clientY;
                const nextHeight = this.resizeState.startHeight + deltaY;

                this.maximized = false;

                // 如果高度太小，则自动隐藏
                if (nextHeight < 40) {
                    if (!this.hidden) {
                        this.layoutStore.hideWorkbench();
                    }
                    return;
                }

                this.layoutStore.showWorkbench();
                // 限制最小高度 120px，最大高度 80vh
                this.panelHeight = Math.max(
                    120,
                    Math.min(window.innerHeight * 0.8, nextHeight)
                );
                this.refreshActivePanel();
            });
        },
        stopResize() {
            this.resizeState = null;
            document.body.style.cursor = "";
        },
        refreshActivePanel() {
            this.$nextTick(() => {
                if (this.$refs.activePanel && this.$refs.activePanel.refresh) {
                    this.$refs.activePanel.refresh();
                }
            });
        },
    },
};
</script>

<style scoped>
.workbench-panel {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: var(--app-theme-workbench-bg);
    border-top: 1px solid var(--app-theme-border);
    position: relative;
    min-height: 0;
    z-index: 10;
    /* 开启硬件加速 */
    transform: translateZ(0);
}

/* 隐藏状态样式优化 */
.workbench-panel-hidden {
    border-top: none !important;
    background: transparent !important;
}

.workbench-panel-hidden:hover {
    /* 悬浮在隐藏条上时，加强阴影提示 */
    box-shadow: inset 0 3px 6px -2px rgba(0, 0, 0, 0.22) !important;
}

.workbench-panel-header {
    height: 30px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px 0 0;
    box-sizing: border-box;
    background: var(--app-theme-workbench-panel-bg);
    border-bottom: 1px solid var(--app-theme-border);
    cursor: ns-resize; /* 整个头部都可拖拽高度 */
    user-select: none;
}

.workbench-panel-tabs {
    flex: 1;
    min-width: 0;
}

/* 防止拖拽时选中文字或按钮干扰 */
.is-resizing {
    user-select: none !important;
}

.workbench-panel-actions {
    display: flex;
    align-items: center;
    padding-left: 8px;
    background: var(--app-theme-workbench-panel-bg);
    cursor: default;
}

.workbench-panel-action-btn {
    width: 22px;
    height: 22px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--app-theme-text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
}

.workbench-panel-action-btn:hover {
    background: var(--app-theme-hover-background);
    color: var(--app-theme-text-primary);
}

.workbench-panel-body {
    flex: 1;
    min-height: 0;
    background: var(--app-theme-workbench-bg);
    overflow: hidden;
}

.workbench-panel-content {
    height: 100%;
}

/* Element UI Tabs 样式覆盖 */
.workbench-panel-tabs /deep/ .el-tabs__header {
    margin: 0;
    border-bottom: none;
}

.workbench-panel-tabs /deep/ .el-tabs__nav-wrap::after {
    display: none;
}

.workbench-panel-tabs /deep/ .el-tabs__item {
    height: 30px;
    line-height: 30px;
    font-size: 12px;
    color: var(--app-theme-text-secondary);
    padding: 0 12px;
}

.workbench-panel-tabs /deep/ .el-tabs__item.is-active {
    color: var(--app-theme-text-primary);
}
</style>
