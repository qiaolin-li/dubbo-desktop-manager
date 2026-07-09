<template>
    <div class="app-tabs  app-bottom-line">
        <!-- 标签导航滚动区域，监听滚轮事件实现横向滚动 -->
        <div ref="tabNavScroll" class="app-tabs-nav-scroll" @wheel.prevent="handleTabNavWheel">
            <div ref="tabListElement" class="app-tabs-nav">
                <!-- 每个标签项，hover 时显示完整标题 tooltip -->
                <el-tooltip v-for="tab in displayTabs" :key="tab.id" effect="light" :content="tab.tooltip" placement="bottom" :disabled="!tab.tooltip" :open-delay="500">
                    <div class="app-tabs-item notSelect" :class="{ 'is-active': activeId === tab.id, 'is-dirty': tab.dirty }"
                        :data-tab-id="tab.id"
                        @click="$emit('change', tab)"
                        @contextmenu.prevent="$emit('contextmenu', tab)"
                        @pointerdown="handleTabPointerDown(tab, $event)">
                        
                        <!-- 标签图标 -->
                        <app-icon v-if="tab.icon || tab.image" :icon-class="tab.icon" :image-src="tab.image" :alt="tab.label" :size="14" />
                        <!-- 标签标题 -->
                        <span class="app-tabs-title">{{ tab.label }}</span>
                        <!-- 脏状态小圆点（有未保存内容时显示） -->
                        <span v-if="tab.dirty" class="app-tabs-dirty-dot"></span>
                        <!-- 关闭按钮 -->
                        <button v-if="tab.closable" class="app-tabs-close-button" type="button" @click.stop="$emit('close', tab)">
                            <i class="el-icon-close"></i>
                        </button>
                    </div>
                </el-tooltip>
            </div>
        </div>

        <!-- 右侧操作区：自定义插槽 + 溢出下拉菜单 -->
        <div v-if="showActions" class="app-tabs-actions">
            <slot name="actions"></slot>
            <!-- 标签过多时显示下拉菜单，列出所有标签 -->
            <el-dropdown v-if="showOverflowMenu" trigger="click" size="mini" @command="handleOverflowCommand">
                <button class="app-tabs-action-button" type="button" title="More Tabs">
                    <i class="el-icon-more"></i>
                </button>
                <el-dropdown-menu slot="dropdown" class="app-tabs-overflow-menu">
                    <el-dropdown-item v-for="tab in displayTabs" :key="tab.id" :command="{ action: 'active', tab: tab }">
                        <div class="app-tabs-overflow-item">
                            <app-icon :icon-class="tab.icon" :image-src="tab.image" :alt="tab.label" :size="14" class="app-tabs-overflow-icon-view"/>
                            <span class="app-tabs-overflow-text">{{ tab.label }}</span>
                            <span v-if="tab.dirty" class="app-tabs-dirty-dot app-tabs-dirty-dot-inline"></span>
                        </div>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>

        <!-- 拖动时的跟随代理元素，视觉上跟随鼠标移动 -->
        <div v-if="dragState" class="app-tabs-drag-proxy" :style="dragProxyStyle">
            <app-icon v-if="dragTab && (dragTab.image || dragTab.icon)" :icon="dragTab.image || dragTab.icon" :alt="dragTab.label" size="14" class="app-tabs-icon-view"/>
            <span class="app-tabs-title">{{ dragTab.label }}</span>
            <span v-if="dragTab && dragTab.dirty" class="app-tabs-dirty-dot"></span>
            <!-- 关闭按钮仅作展示，禁用交互 -->
            <button v-if="dragTab && dragTab.closable" class="app-tabs-close-button is-passive" type="button">
                <i class="el-icon-close"></i>
            </button>
        </div>
    </div>
</template>

<script>

import AppIcon from '@/renderer/components/button/icon.vue'

/** 触发拖动的最小移动距离（像素），防止误触 */
const DRAG_THRESHOLD = 4;

/** 靠近边缘多少像素时触发自动滚动 */
const EDGE_SCROLL_THRESHOLD = 40;

/** 每次自动滚动的步长（像素） */
const EDGE_SCROLL_STEP = 16;

export default {
    name: "AppTabs",
    components: {
        AppIcon
    },
    props: {
        /** 标签列表数据 */
        tabs: { 
            type: Array, 
            default: () => [] 
        },
        
        /** 当前激活的标签 id */
        activeId: { 
            type: [String, Number], 
            default: "" 
        },

        /** 是否允许拖动排序 */
        draggable: { 
            type: Boolean, 
            default: true 
        },
    },
    data() {
        return {
            /** 实际渲染的标签列表（拖动时与 tabs 不同步，避免拖动过程中被外部重置） */
            displayTabs: [],

            /** 是否显示溢出下拉菜单 */
            showOverflowMenu: false,

            // 正在进行的拖动状态（超过阈值后正式拖动）
            dragState: null,
        };
    },
    computed: {
        // 是否显示右侧操作区（有溢出菜单或自定义插槽时显示）
        showActions() {
            return this.showOverflowMenu || Boolean(this.$slots.actions);
        },
        // 当前正在拖动的标签数据
        dragTab() {
            return this.dragState ? this.getTab(this.dragState.tabId) : null;
        },
        // 拖动代理元素的位置和尺寸样式
        dragProxyStyle() {
            if (!this.dragState) {
                return {};
            }
            return {
                width: `${this.dragState.width}px`,
                height: `${this.dragState.height}px`,
                // left = 鼠标位置 - 鼠标在标签内的偏移，让代理元素和原标签对齐
                left: `${this.dragState.clientX - this.dragState.offsetX}px`,
                top: `${this.dragState.top}px`,
            };
        },
    },
    watch: {
        // 外部 tabs 变化时同步到 displayTabs（拖动中不同步，防止打断拖动）
        tabs: {
            immediate: true,  // 组件创建时立即执行 handler
            handler() {
                if (!this.dragState) {
                    this.displayTabs = this.tabs.slice();
                }
                this.$nextTick(() => this.syncTabNavState());
            },
        },
        // 激活标签变化时，自动滚动到该标签
        activeId() {
            this.$nextTick(() => {
                this.scrollToCurrentTab();
            });
        },
    },
    created(){
        // 在这里初始化一些不需要响应式的变量，避免额外开销

        // 监听容器尺寸变化的观察者
        this.resizeObserver = null;
        
        // 待确认的拖动状态（鼠标按下但还未超过阈值）
        this.pendingDrag = null;

        // 当前正在被拖动的标签 id
        this.draggedTabId = null;
    },
    mounted() {
        this.initTabNav();
    },
    beforeDestroy() {
        // 组件销毁时清理观察者和全局事件监听，防止内存泄漏
        this.destroyTabNav();
        this.removeGlobalDragListeners();
    },
    methods: {
        /**
         * 初始化标签导航：启动 ResizeObserver 监听尺寸变化
         */
        initTabNav() {
            this.resizeObserver = new ResizeObserver(() => {
                this.updateOverflowState();
            });
            this.resizeObserver.observe(this.$refs.tabNavScroll);
            this.resizeObserver.observe(this.$refs.tabListElement);
            this.syncTabNavState();
        },

        /**
         * 销毁 ResizeObserver
         */
        destroyTabNav() {
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
                this.resizeObserver = null;
            }
        },

        /**
         * 同步标签导航状态：更新溢出状态 + 滚动到当前标签
         */
        syncTabNavState() {
            // 检查是否要显示更多按钮
            this.updateOverflowState();

            // 滚动到当前标签
            this.scrollToCurrentTab();
        },

        /**
         * 判断标签列表是否超出容器宽度，决定是否显示溢出下拉菜单
         */
        updateOverflowState() {
            // 标签列表实际宽度 > 容器可见宽度时，显示溢出菜单
            this.showOverflowMenu = this.$refs.tabListElement.scrollWidth > this.$refs.tabNavScroll.clientWidth + 1;
        },

        /**
         * 鼠标滚轮事件：将垂直滚动转换为水平滚动
         * @param event 
         */
        handleTabNavWheel(event) {
            if (!this.$refs.tabNavScroll) {
                return;
            }
            // 取 deltaY 和 deltaX 中绝对值更大的方向作为滚动量
            const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
            if (delta === 0) {
                return;
            }
            this.$refs.tabNavScroll.scrollLeft += delta;
        },

        /**
         * 鼠标按下：记录待确认拖动信息，等待移动超过阈值后才正式开始拖动
         * @param tab  
         * @param event 
         */
        handleTabPointerDown(tab, event) {

            // 以下情况不触发拖动
            // 1. 拖拽功能关闭的情况
            // 2. 不是左键按下
            // 3. 点击关闭按钮时不触发拖动
            if (!this.draggable || event.button !== 0 || event.target.closest(".app-tabs-close-button")) {
                return;
            }

            const rect = event.currentTarget.getBoundingClientRect();
            this.pendingDrag = {
                tabId: tab.id,
                startX: event.clientX,
                startY: event.clientY,
                // 鼠标在标签内的偏移，用于让代理元素和原标签位置对齐
                offsetX: event.clientX - rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
            };
            this.addGlobalDragListeners();
        },

        /**
         * 注册全局指针事件监听（move/up/cancel）
         */
        addGlobalDragListeners() {
            window.addEventListener("pointermove", this.handleGlobalPointerMove);
            window.addEventListener("pointerup", this.handleGlobalPointerUp);
            window.addEventListener("pointercancel", this.handleGlobalPointerUp);
        },

        /**
         * 移除全局指针事件监听
         */
        removeGlobalDragListeners() {
            window.removeEventListener("pointermove", this.handleGlobalPointerMove);
            window.removeEventListener("pointerup", this.handleGlobalPointerUp);
            window.removeEventListener("pointercancel", this.handleGlobalPointerUp);
        },

        /**
         * 全局鼠标移动：判断是否超过拖动阈值，超过则正式开始拖动
         * @param event 
         */
        handleGlobalPointerMove(event) {
            // 不是在拖动中，忽略
            if (!this.pendingDrag) {
                return;
            }

            // 还未正式开始拖动，判断移动距离是否超过阈值
            if (!this.dragState) {
                const deltaX = Math.abs(event.clientX - this.pendingDrag.startX);
                const deltaY = Math.abs(event.clientY - this.pendingDrag.startY);
                if (deltaX < DRAG_THRESHOLD && deltaY < DRAG_THRESHOLD) {
                    return;
                }
                // 超过阈值，正式开始拖动
                this.startDrag(event);
            }
            event.preventDefault();
            // 更新代理元素的水平位置
            this.dragState.clientX = event.clientX;
            // 靠近左右边缘时自动滚动
            this.handleEdgeAutoScroll(event.clientX);
            // 根据鼠标位置计算新的标签顺序
            this.moveDraggedTab(event.clientX);
        },

        /**
         * 正式开始拖动：初始化 dragState
         * @param event 
         */
        startDrag(event) {
            if (!this.pendingDrag) {
                return;
            }
            this.draggedTabId = this.pendingDrag.tabId;
            this.dragState = {
                ...this.pendingDrag,
                clientX: event.clientX,
                clientY: event.clientY,
            };
            // 给 body 加 class，可用于全局禁用文本选中等
            document.body.classList.add("page-tabs-dragging");
        },

        /**
         * 根据鼠标位置计算标签新顺序，必要时更新 displayTabs 并触发动画
         * @param clientX 
         */
        moveDraggedTab(clientX) {
            const draggedTab = this.getTab(this.draggedTabId);
            if (!draggedTab) {
                return;
            }
            
            // 排除被拖动的标签元素，只用其他标签来计算插入位置
            const otherElements = this.getTabElements().filter(
                (element) => String(element.dataset.tabId) !== String(this.draggedTabId)
            );
            const tabsWithoutDragged = this.displayTabs.filter((tab) => tab.id !== this.draggedTabId);

            // 统计鼠标位置超过了几个标签的中点，得出插入索引，这里找到了还会继续，不过问题不大，tab页面不会很多
            const nextIndex = otherElements.reduce((index, element) => {
                const rect = element.getBoundingClientRect();
                return clientX > rect.left + rect.width / 2 ? index + 1 : index;
            }, 0);

            // 把被拖动标签插入到新位置
            const nextTabs = tabsWithoutDragged.slice();
            nextTabs.splice(nextIndex, 0, draggedTab);

            // 顺序没变则不更新，避免无意义的重渲染
            if (this.isSameOrder(nextTabs, this.displayTabs)) {
                return;
            }

            // 记录更新前的位置，用于 FLIP 动画
            const previousRects = this.captureTabRects();
            this.displayTabs = nextTabs;
            this.$emit("reorder", nextTabs.slice());
            // DOM 更新后执行位移动画
            this.$nextTick(() => this.animateTabLayout(previousRects));
        },

        /**
         * 拖动到边缘时自动滚动标签导航区域
         * @param clientX 
         */
        handleEdgeAutoScroll(clientX) {
            if (!this.$refs.tabNavScroll) {
                return;
            }
            const rect = this.$refs.tabNavScroll.getBoundingClientRect();
            if (clientX < rect.left + EDGE_SCROLL_THRESHOLD) {
                // 靠近左边缘，向左滚动
                this.$refs.tabNavScroll.scrollLeft -= EDGE_SCROLL_STEP;
            } else if (clientX > rect.right - EDGE_SCROLL_THRESHOLD) {
                // 靠近右边缘，向右滚动
                this.$refs.tabNavScroll.scrollLeft += EDGE_SCROLL_STEP;
            }
        },

        // 鼠标释放：清理所有拖动状态
        handleGlobalPointerUp() {
            this.pendingDrag = null;
            this.dragState = null;
            this.draggedTabId = null;
            document.body.classList.remove("page-tabs-dragging");
            this.removeGlobalDragListeners();
            this.$nextTick(() => this.syncTabNavState());
        },

        /**
         * 记录所有标签当前的位置信息，用于 FLIP 动画的"起始帧"
         */
        captureTabRects() {
            return this.getTabElements().reduce((result, element) => {
                result[element.dataset.tabId] = element.getBoundingClientRect();
                return result;
            }, {});
        },

        /**
         * FLIP 动画：用"起始位置 - 当前位置"的差值做位移，再过渡到 0，视觉上产生平滑移动效果
         * @param previousRects 
         */
        animateTabLayout(previousRects) {
            this.getTabElements().forEach((element) => {
                // 跳过被拖动的元素，它由 proxy 跟随鼠标，不需要动画
                if (String(element.dataset.tabId) === String(this.draggedTabId)) {
                    return;
                }
                const previousRect = previousRects[element.dataset.tabId];
                if (!previousRect) {
                    return;
                }
                const currentRect = element.getBoundingClientRect();
                const deltaX = previousRect.left - currentRect.left;
                if (!deltaX) {
                    return;
                }
                // 先瞬间移到旧位置（无动画）
                element.style.transition = "none";
                element.style.transform = `translateX(${deltaX}px)`;
                // 下一帧开启过渡，回到新位置，产生动画效果
                requestAnimationFrame(() => {
                    element.style.transition = "transform 180ms cubic-bezier(0.2, 0, 0, 1)";
                    element.style.transform = "";
                });
            });
        },

        /**
         * 获取标签导航区域内所有标签 DOM 元素
         */
        getTabElements() {
            return this.$refs.tabListElement ? Array.from(this.$refs.tabListElement.querySelectorAll(".app-tabs-item")) : [];
        },

        // 判断两个标签数组的顺序是否完全相同
        isSameOrder(first, second) {
            if (first.length !== second.length) {
                return false;
            }
            return first.every((tab, index) => tab.id === second[index].id);
        },

        // 溢出下拉菜单命令处理：激活对应标签
        handleOverflowCommand(command) {
            if (!command?.tab) {
                return;
            }
            if (command.action === "active") {
                this.$emit("change", command.tab);
            }
            this.$emit("overflow-command", command, command.tab);
        },

        // 滚动导航区域，确保当前激活的标签在可见范围内
        scrollToCurrentTab() {
            if (!this.$refs.tabNavScroll) {
                return;
            }
            const currentTabElement = this.$refs.tabListElement ? this.$refs.tabListElement.querySelector(`.app-tabs-item[data-tab-id="${this.activeId}"]`) : null;
            if (!currentTabElement) {
                return;
            }
            const tabLeft = currentTabElement.offsetLeft;
            const tabRight = tabLeft + currentTabElement.offsetWidth;
            const viewportLeft = this.$refs.tabNavScroll.scrollLeft;
            const viewportRight = viewportLeft + this.$refs.tabNavScroll.clientWidth;
            // 标签在左侧不可见，滚动到标签左边缘
            if (tabLeft < viewportLeft) {
                this.$refs.tabNavScroll.scrollLeft = tabLeft;
            // 标签在右侧不可见，滚动到标签右边缘
            } else if (tabRight > viewportRight) {
                this.$refs.tabNavScroll.scrollLeft = tabRight - this.$refs.tabNavScroll.clientWidth;
            }
        },

        // 根据 id 从 displayTabs 中查找标签数据
        getTab(tabId) {
            return this.displayTabs.find((tab) => tab.id === tabId);
        },
    },
};
</script>

<style>
.app-tabs {
    display: flex;
    align-items: stretch;
    height: 32px;
    flex-shrink: 0;
    width: 100%;
    background-color: var(--app-theme-tabs-bg);
    border-bottom: none;
    position: relative;
}

.app-tabs-bottom-line::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background: var(--app-theme-tabs-border);
    z-index: 0;
}


.app-tabs-nav-scroll {
    flex: 1 1 auto;
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

/* 隐藏滚动条 */
.app-tabs-nav-scroll::-webkit-scrollbar {
    display: none;
}

.app-tabs-nav {
    display: inline-flex;
    align-items: flex-start;
    padding: 0px 0px;
    gap: 0;
    white-space: nowrap;
    height: 100%;
    /* box-sizing: border-box; */
}
.app-tabs-item {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
    max-width: 220px;
    height:  100%;
    padding: 0 8px;
    color: var(--app-theme-tabs-text);
    border: 1px solid var(--app-theme-tabs-border);
    border-top: none;
    border-bottom: none;
    font-size: 13px;
    font-weight: 400;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.16s ease, color 0.16s ease, border-color 0.16s ease;
    will-change: background-color, color, border-color;
    /* box-sizing: border-box; */
}
.app-tabs-item + .app-tabs-item {
    margin-left: -1px;
}
/* .app-tabs-item:not(.is-active) {
    border-color: #e1e6ee;
} */
.app-tabs-item:hover {
    background-color: var(--app-theme-titlebar-tab-hover-bg);
    color: var(--app-theme-tabs-active-text);
    border-color: var(--app-theme-tabs-border);
    z-index : 2;
}
.app-tabs-item.is-active {
    background-color: var(--app-theme-tabs-surface);
    color: var(--app-theme-tabs-active-text);
    border-color: var(--app-theme-tabs-border);
    box-shadow: none;
    z-index : 2;
}


.app-tabs-item.is-active::after {
    content: '';
    position: absolute;
    left: 0px;
    right: 0px;
    bottom: 0px;
    height: 2px;
    background-color: #409EFF;
}

.app-tabs-item > * {
    position: relative;
    z-index: 1;
}
.app-tabs-title {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.app-tabs-dirty-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: #d29922;
    flex-shrink: 0;
}
.app-tabs-dirty-dot-inline {
    margin-left: 8px;
}
.app-tabs-close-button {
    width: 18px;
    height: 18px;
    padding: 0;
    margin-left: 2px;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--app-theme-text-tertiary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: background-color 0.15s ease, color 0.15s ease;
}
.app-tabs-close-button .el-icon-close {
    font-size: 11px;
    transform: scale(0.92);
}
.app-tabs-close-button:hover {
    background-color: var(--app-theme-tabs-close-hover-bg);
    color: var(--app-theme-tabs-close-hover-text);
}
.app-tabs-close-button.is-passive {
    pointer-events: none;
}
.app-tabs-actions {
    display: flex;
    align-items: center;
    padding: 0 6px 0 2px;
    background-color: var(--app-theme-tabs-muted);
    border-left: 1px solid var(--app-theme-tabs-border);
    flex-shrink: 0;
}
.app-tabs-action-button {
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 4px;
    padding: 0;
    background: transparent;
    color: var(--app-theme-text-secondary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease;
}
.app-tabs-action-button:hover {
    background-color: var(--app-theme-tabs-close-hover-bg);
    color: var(--app-theme-tabs-close-hover-text);
}
.app-tabs-overflow-menu {
    max-width: 420px;
}
.app-tabs-overflow-item {
    display: flex;
    align-items: center;
    min-width: 0;
    max-width: 360px;
}
.app-tabs-overflow-icon-view {
    margin-right: 8px;
    color: var(--app-theme-text-secondary);
    flex-shrink: 0;
}
.app-tabs-overflow-text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.app-tabs-drag-proxy {
    position: fixed;
    z-index: 9999;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 0 8px;
    background-color: var(--app-theme-tabs-surface);
    color: var(--app-theme-tabs-active-text);
    border: 1px solid var(--app-theme-tabs-border);
    border-top: none;
    border-bottom: none;
    box-shadow: var(--app-theme-shadow);
    pointer-events: none;
    font-size: 13px;
    font-weight: 400;
}
</style>
