<template>
    <div class="page-tabs-container">
        <!-- 标签导航栏，tabList 为空时隐藏 -->
        <app-tabs class="page-tabs-tab" v-show="tabList.length > 0" :tabs="tabList" :active-id="currentTabId"
            @change="setCurrentTab" @close="removeTab" @contextmenu="openTabContextMenu"
            @overflow-command="handleOverflowCommand" @reorder="handleTabReorder" />

        <!-- 标签内容区，每个 tab 对应一个组件，用 v-show 切换显示 -->
        <div v-show="tabList.length > 0" class="page-tabs-view">
            <!-- 用错误边界包裹，捕获插件组件渲染异常 -->
            <tab-error-boundary v-for="tab in tabList" :key="getComponentKey(tab)" :label="tab.label"
                v-show="currentTabId == tab.id" @retry="forceUpdateComponent(tab)">
                <!-- eslint-disable-next-line vue/require-component-is -->
                <component :ref="getComponentRef(tab.id)" v-bind="componentProps(tab)" />
            </tab-error-boundary>
        </div>

        <!-- 没有任何 tab 时显示欢迎页 -->
        <component :is="welcomeComponent" v-if="tabList.length == 0 && welcomeComponent" />
    </div>
</template>

<script>
import { appWindow }        from "@/renderer/core/AppRenderer.js";
import AppTabs              from "@/renderer/components/tabs/index.vue";
import TabErrorBoundary     from "@/renderer/components/TabErrorBoundary.js";

/**
 * 标签错误边界组件
 * 捕获子组件渲染时的异常，显示友好的错误提示和重试按钮
 * 防止单个插件页面崩溃影响整个应用
 */
// const TabErrorBoundary = {
//     name: "TabErrorBoundary",
//     props: {
//         tab: { 
//             type: Object, 
//             required: true 
//         },
//     },
//     data() {
//         return {
//             // 捕获到的错误信息，null 表示正常
//             error: null,
//         };
//     },
//     methods: {
//         // 判断是否是组件缺失类型的错误（插件未注册、加载失败等）
//         isMissingComponentError(error) {
//             const message = error?.message ?? "";
//             return [
//                 "Unknown custom element",
//                 "Failed to mount component",
//                 "render function not defined",
//                 "Async component loader resolved to undefined",
//                 "Cannot find module",
//                 "Cannot find component",
//             ].some(keyword => message.indexOf(keyword) >= 0);
//         },
//     },

//     /**
//      * Vue 错误捕获钩子，捕获子组件抛出的错误
//      */
//     errorCaptured(error, vm, info) {
//         const componentName = vm?.$options?.name ?? "";
//         console.error("tab render error", componentName, error, info);
//         // 只处理组件缺失类的错误，其他错误继续向上冒泡
//         if (this.isMissingComponentError(error, info)) {
//             this.error = { error, info };
//         }
//         // 返回 false 阻止错误继续向上传播
//         return false;
//     },
//     render(h) {
//         // 正常状态：直接渲染插槽内容
//         if (!this.error) {
//             return h("div", { class: "page-tab-boundary" }, this.$slots.default);
//         }

//         // 错误状态：显示错误提示和重试按钮
//         const message = this.error.error?.message ?? "未知错误";
//         const label = this.tab?.label ? `插件页面渲染失败：${this.tab.label}` : "插件页面渲染失败";
//         return h("div", { class: "page-tab-boundary page-tab-error" }, [
//             h("div", { class: "page-tab-error-title" }, label),
//             h("div", { class: "page-tab-error-message" }, message),
//             h("button", {
//                 class: "page-tab-error-action",
//                 attrs: { type: "button" },
//                 on: {
//                     click: () => this.$emit("retry"),
//                 },
//             }, "重新加载"),
//         ]);
//     },
// };

export default {
    name: "AppPages",
    components: { 
        AppTabs, 
        TabErrorBoundary, 
    },
    props: {
        /** 无 tab 时显示的欢迎页组件 */
        welcomeComponent: { 
            type: [Object, String], 
            default: null 
        },
    },
    data() {
        return { 
            /** 自增 tab id，每次新建 tab 时递增 */
            tabIndex: 1, 

            /** 当前激活的 tab id */
            currentTabId: "", 

            /** tab 列表 */
            tabList: [] 
        };
    },
    methods: {
        /**
         * 切换当前激活的 tab
         * @param tabId 
         */
        setCurrentTab(tab) {
            this.currentTabId = tab.id;
        },

        /**
         * 获取 tab 内容组件的 ref 名称
         * @param tabId 
         */
        getComponentRef(tabId) {
            return `page-tab-component-${tabId}`;
        },

        /**
         * 处理用户拖动排序后的 tab 列表
         * @param {Array} nextTabs 拖动后的最新顺序
         */
        handleTabReorder(nextTabs) {
            this.tabList = [...nextTabs];
        },

        /**
         * 构造动态组件所需的 props
         * 优先使用 Vue 组件，否则降级为 iframe
         * @param {Object} tab 标签数据
         */
        componentProps(tab) {
            // 有 Vue 组件直接渲染
            if (tab.component) {
                return { is: tab.component, ...tab.params };
            }

            // 降级为 iframe 渲染外部页面
            return {
                target: "_blank",
                rel: "noopener",
                is: "iframe",
                src: tab.src,
                width: "100%",
                height: "100%",
                style: "vertical-align:top",
                webpreferences: "nodeIntegration=true, contextIsolation=false",
            };
        },

        /**
         * 打开标签右键菜单
         * @param {Object} tab 右键点击的标签数据
         */
        openTabContextMenu(tab) {
            const menuTemplate = [
                {
                    label: this.$t("tab.refresh"),
                    click: async () => this.forceUpdateComponent(tab),
                },
                { type: "separator" },
                // 只有可关闭的 tab 才显示关闭选项
                ...(tab.closable ? [{
                    label: this.$t("tab.close"),
                    click: async () => this.removeTab(tab),
                }] : []),
                {
                    label: this.$t("tab.closeOther"),
                    click: async () => this.removeOtherTab(tab),
                },
                {
                    label: this.$t("tab.closeAll"),
                    click: async () => this.removeAllTab(tab),
                },
            ];

            // 插件扩展的自定义菜单项
            const extraMenus = this.resolveTabContextMenus(tab);
            if (extraMenus.length > 0) {
                menuTemplate.push({ type: "separator" }, ...extraMenus);
            }

            appWindow.popupMenu({ template: menuTemplate });
        },

        /**
         * 解析插件扩展的右键菜单项
         * 支持函数式（getContextMenus）和静态（contextMenus）两种方式
         * @param {Object} tab 标签数据
         * @returns {Array} 菜单项列表
         */
        resolveTabContextMenus(tab) {
            const menuItems = (tab.getContextMenus?.(tab, this) ?? tab.contextMenus) ?? [];
            return menuItems.map((menu) => ({
                ...menu,
                // 包装 click，注入 tab 和组件实例作为参数
                click: menu.click ? () => menu.click(tab, this) : undefined,
            }));
        },

        /**
         * 处理溢出下拉菜单的命令
         * @param {Object} command 菜单命令
         */
        handleOverflowCommand(command) {
            if (!command?.id) {
                return;
            }
            if (command.action === "active") {
                this.setCurrentTab(command.id);
            }
        },

        /**
         * 创建规范化的 tab 数据对象
         * @param {Object} tabInfo 外部传入的标签信息
         * @returns {Object} 规范化后的标签对象
         */
        createTab(tabInfo) {
            const id = `${this.tabIndex++}`;
            return {
                id,
                label: tabInfo.label,
                tooltip: tabInfo.tooltip,
                // 用于判断是否是同一个 tab 的唯一键
                primaryKey: tabInfo.primaryKey || id,
                src: tabInfo.src,
                component: tabInfo.component,
                icon: tabInfo.icon ?? "el-icon-document",
                closable: tabInfo.closable !== false,
                params: tabInfo.params,
                dirty: Boolean(tabInfo.dirty),
                // 强制刷新时递增，触发组件重新挂载
                renderKey: 0,
                contextMenus: tabInfo.contextMenus || [],
                getContextMenus: tabInfo.getContextMenus,

                /**
                 * 设置标签脏状态（有未保存内容时标记）
                 * @param {boolean} dirty 是否为脏状态
                 */
                setTabDirty(dirty) {
                    this.dirty = Boolean(dirty);
                },
            };
        },

        /**
         * 新增 tab
         * 如果同 primaryKey 的 tab 已存在且不允许多实例，则激活已有 tab 并更新数据
         * @param {Object} tabInfo 标签信息
         * @returns {Object} 新建或已有的 tab 对象
         */
        addTab(tabInfo) {
            const newTab = this.createTab(tabInfo);
            const existTab = this.tabList.find(tab => tab.primaryKey === newTab.primaryKey);

            // 允许多实例或不存在同 key 的 tab，直接新建
            if (tabInfo.multiInstance || !existTab) {
                this.tabList.push(newTab);
                this.currentTabId = newTab.id;
                return newTab;
            }

            // 已存在同 key 的 tab，更新数据并激活
            Object.assign(existTab, {
                label: newTab.label,
                tooltip: newTab.tooltip,
                icon: newTab.icon,
                dirty: newTab.dirty,
                params: newTab.params ?? existTab.params,
                contextMenus: newTab.contextMenus,
                getContextMenus: newTab.getContextMenus,
            });
            this.currentTabId = existTab.id;
            return existTab;
        },

        /**
         * 计算 tab 内容组件的渲染 key
         * renderKey 变化时会触发组件重新挂载（强制刷新用）
         * @param {Object} tab 标签数据
         * @returns {string} 渲染 key
         */
        getComponentKey(tab) {
            return `${tab.id}-${tab.renderKey ?? 0}`;
        },

        // 根据 id 查找 tab
        getTab(tabId) {
            return this.tabList.find((tab) => tab.id === tabId);
        },

        /**
         * 关闭指定 tab
         * 如果关闭的是当前激活的 tab，自动激活相邻的 tab
         * @param {Object} tab 要关闭的标签
         */
        removeTab(tab) {
            if (!tab || !tab.closable) {
                return;
            }

            const tabs = this.tabList;
            for (let index = 0; index < tabs.length; index += 1) {
                if (tabs[index].id == tab.id) {
                    tabs.splice(index, 1);

                    // 关闭的是当前激活的 tab，激活后一个或前一个
                    if (this.currentTabId === tab.id) {
                        const nextTab = tabs[index] || tabs[index - 1];
                        if (nextTab) {
                            this.currentTabId = nextTab.id;
                        }
                    }
                    break;
                }
            }
        },

        /**
         * 关闭其他所有可关闭的 tab，保留不可关闭的和当前传入的 tab
         * @param {Object} tab 要保留的标签
         */
        removeOtherTab(tab) {
            this.tabList = this.tabList.filter((info) => !info.closable || info.id === tab.id);

            // 当前激活的 tab 还在，不需要切换
            if (this.tabList.find((info) => info.id === this.currentTabId)) {
                return;
            }

            // 当前激活的 tab 被关闭了，切换到保留的 tab
            this.currentTabId = tab.id;
        },

        /**
         * 关闭所有可关闭的 tab，只保留不可关闭的
         * @param {Object} tab 触发操作的标签（用于兜底激活）
         */
        removeAllTab(tab) {
            this.tabList = this.tabList.filter((info) => !info.closable);

            // 当前激活的 tab 还在，不需要切换
            if (this.tabList.find((info) => info.id === this.currentTabId)) {
                return;
            }

            // 优先激活触发操作的 tab，否则激活第一个，都没有则清空
            this.currentTabId = (this.tabList.find((info) => info.id === tab.id) || this.tabList[0])?.id || "";
        },

        /**
         * 强制刷新单个标签（重新挂载组件）
         * 通过递增 renderKey 触发 key 变化，Vue 会销毁并重建组件
         * @param {Object} tab 要刷新的标签
         */
        forceUpdateComponent(tab) {
            if (!tab) {
                return;
            }
            tab.renderKey = (tab.renderKey ?? 0) + 1;
            this.$nextTick(() => {
                this.currentTabId = tab.id;
            });
        },
    },
};
</script>

<style>
.page-tabs-container {
    margin: 0;
    background-color: var(--app-theme-bg);
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    color: var(--app-theme-text-primary);
}

.page-tabs-view {
    position: relative;
    z-index: 0;
    background-color: var(--app-theme-bg);
    overflow-y: auto;
    flex: 1 1 auto;
    min-height: 0;
    color: var(--app-theme-text-primary);
}

.page-tab-boundary {
    height: 100%;
}

.page-tab-error {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    box-sizing: border-box;
    padding: 28px 32px;
    background-color: var(--app-theme-bg);
    color: var(--app-theme-text-primary);
}

.page-tab-error-title {
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
}

.page-tab-error-message {
    max-width: 760px;
    margin-bottom: 14px;
    color: var(--app-theme-text-secondary);
    font-size: 12px;
    line-height: 1.6;
    word-break: break-word;
}

.page-tab-error-action {
    height: 26px;
    padding: 0 12px;
    border: 1px solid var(--app-theme-border);
    border-radius: 4px;
    outline: none;
    background-color: var(--app-theme-surface);
    color: var(--app-theme-text-primary);
    cursor: pointer;
    font-size: 12px;
}

.page-tab-error-action:hover {
    border-color: var(--app-theme-primary);
    color: var(--app-theme-primary);
}

.page-tab-tooltip.el-tooltip__popper.is-light {
    padding: 8px 12px;
    border: 1px solid var(--app-theme-tooltip-border);
    border-radius: 6px;
    background: var(--app-theme-tooltip-bg);
    color: var(--app-theme-tooltip-text);
    font-size: 12px;
    line-height: 1.45;
    box-shadow: var(--app-theme-shadow);
}

.page-tab-tooltip.el-tooltip__popper[x-placement^="bottom"] .popper__arrow {
    border-bottom-color: var(--app-theme-tooltip-border);
}

</style>
