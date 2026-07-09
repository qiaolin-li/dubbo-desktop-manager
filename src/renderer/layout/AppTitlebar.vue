<template>
    <div class="app-titlebar dragRegion" @dblclick="toggleMaximize">
        <div :class="['titlebar-left titlebar-menu-list noDragRegion', onlyHomeTab ? 'titlebar-left-right-border' : '']" @dblclick.stop>
            <ddmIcon v-if="!isMac" :width="20" :height="20" class="titlebar-app-icon dragRegion"/>
            <div v-if="homeTab" class="titlebar-home-button" :class="{ active: layoutStore.currentPageId === homeTab.id}" @click="openPage(homeTab)" @contextmenu.stop.prevent="openMenuList(homeTab)">
                <app-icon icon-class="el-icon-s-home" alt="home" :size="14" />
                <span class="titlebar-home-label">{{ homeTab.label }}</span>
            </div>
        </div>
        <div class="titlebar-tabs titlebar-menu-list noDragRegion"  @dblclick.stop>
            <app-tabs :tabs="layoutStore.tabList" :active-id="layoutStore.currentPageId"  
                @change="openPage" @close="tab => layoutStore.closeTab(tab.id)"
                @contextmenu="openMenuList" @reorder="handleTitlebarTabReorder" />
        </div>
        <div class="titlebar-drag-gap"></div>
        <div class="titlebar-right app-bottom-line">
            <div class="titlebar-right-slot noDragRegion" @dblclick.stop>
                <app-icon-group  class="titlebar-link-list" :gap="2">
                    <app-icon-button v-for="menu in layoutStore.toolbarMenuList" :key="menu.id"
                        :tooltip="menu.label" :icon-class="menu.icon" :active="layoutStore.currentPageId == menu.id" @click="openPage(menu)" @contextmenu="handleToolbarMenuContextmenu($event, menu)" />
                    <app-divider />
                    <app-icon-button :tooltip="$t('titlebar.plugins')" icon-class="el-icon-box" :active="layoutStore.currentPageId == 'plugins'" @click="openPlugins" />
                    <app-icon-button :tooltip="$t('titlebar.settings')" icon-class="el-icon-setting" @click="openSettings" />
                    <app-divider />
                    <app-icon-button :tooltip="$t('titlebar.logs')" :icon-class="layoutStore.workbenchVisible ? 'app-icon-workbench-open' : 'app-icon-workbench-closed'" :active="layoutStore.workbenchVisible" @click="layoutStore.toggleWorkbench()" />
                    <app-divider />
                    <el-popover placement="bottom-end" trigger="click" popper-class="titlebar-tools-popper" width="280">
                        <div class="titlebar-tools-menu">

                            <app-icon-button class="titlebar-tools-item" icon-class="el-icon-refresh" :text="$t('titlebar.forceReload')" :block="true" @click="handleToolsAction(forceReload)"/>
                            <app-icon-button class="titlebar-tools-item" :imageSrc="devtoolsIcon" :text="$t('titlebar.devtools')" :block="true" @click="handleToolsAction(openDevTools)" />
                            <app-icon-button class="titlebar-tools-item" icon-class="el-icon-present" :text="$t('titlebar.donateTitle')"  :block="true" @click="showDonatePanel = !showDonatePanel"/>
                            <div v-show="showDonatePanel" class="titlebar-donate-card">
                                <div class="titlebar-donate-desc">{{ $t('titlebar.donateDesc') }}</div>
                                <img :src="donateImage" class="titlebar-donate-image" alt="Donate" />
                            </div>

                            <app-icon-button  class="titlebar-tools-item" :text="$t('titlebar.github')" :block="true" @click="handleToolsAction(openGithub)">
                                <svg class="titlebar-link-icon" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path clip-rule="evenodd"
                                        d="M24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4ZM0 24C0 10.7452 10.7452 0 24 0C37.2548 0 48 10.7452 48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24Z"
                                        fill="currentColor"
                                        fill-rule="evenodd" />
                                    <path clip-rule="evenodd"
                                        d="M19.1833 45.4716C18.9898 45.2219 18.9898 42.9973 19.1833 38.798C17.1114 38.8696 15.8024 38.7258 15.2563 38.3667C14.437 37.828 13.6169 36.1667 12.8891 34.9959C12.1614 33.8251 10.5463 33.64 9.89405 33.3783C9.24182 33.1165 9.07809 32.0496 11.6913 32.8565C14.3044 33.6634 14.4319 35.8607 15.2563 36.3745C16.0806 36.8883 18.0515 36.6635 18.9448 36.2519C19.8382 35.8403 19.7724 34.3078 19.9317 33.7007C20.1331 33.134 19.4233 33.0083 19.4077 33.0037C18.5355 33.0037 13.9539 32.0073 12.6955 27.5706C11.437 23.134 13.0581 20.2341 13.9229 18.9875C14.4995 18.1564 14.4485 16.3852 13.7699 13.6737C16.2335 13.3589 18.1347 14.1343 19.4734 16.0001C19.4747 16.0108 21.2285 14.9572 24.0003 14.9572C26.772 14.9572 27.7553 15.8154 28.5142 16.0001C29.2731 16.1848 29.88 12.7341 34.5668 13.6737C33.5883 15.5969 32.7689 18.0001 33.3943 18.9875C34.0198 19.9749 36.4745 23.1147 34.9666 27.5706C33.9614 30.5413 31.9853 32.3523 29.0384 33.0037C28.7005 33.1115 28.5315 33.2855 28.5315 33.5255C28.5315 33.8856 28.9884 33.9249 29.6465 35.6117C30.0853 36.7362 30.117 39.948 29.7416 45.247C28.7906 45.4891 28.0508 45.6516 27.5221 45.7347C26.5847 45.882 25.5669 45.9646 24.5669 45.9965C23.5669 46.0284 23.2196 46.0248 21.837 45.8961C20.9154 45.8103 20.0308 45.6688 19.1833 45.4716Z"
                                        fill="currentColor"
                                        fill-rule="evenodd" />
                                </svg>
                            </app-icon-button>
                        </div>
                        <app-icon-button slot="reference" :tooltip="$t('titlebar.more')" icon-class="el-icon-more" />
                    </el-popover>
                </app-icon-group>
            </div>

            <div v-if="!isMac" class="window-controls noDragRegion" @dblclick.stop>
                <button class="window-button" type="button" :title="$t('titlebar.minimize')" @click="minimize">
                    <span class="window-button-line"></span>
                </button>
                <button class="window-button" type="button" :title="isMaximized ? $t('titlebar.restore') : $t('titlebar.maximize')" @click="toggleMaximize">
                    <span v-if="isMaximized" class="window-button-restore"></span>
                    <span v-else class="window-button-square"></span>
                </button>
                <button class="window-button window-button-close" type="button" :title="$t('titlebar.close')" @click="closeWindow">
                    <span class="window-button-close-icon"></span>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { appIpc, appShell, appWindow }                  from '@/renderer/core/AppRenderer.js';

import AppIcon                                          from '@/renderer/components/button/icon.vue'
import ddmIcon 				                            from '@/renderer/components/ddm-icon.vue';
import AppIconButton                                    from '@/renderer/components/button/icon-button.vue';
import AppDivider                                       from '@/renderer/components/divider.vue';
import AppIconGroup                                     from '@/renderer/components/button/icon-group.vue';
import AppTabs                                          from '@/renderer/components/tabs/index.vue';

import settingsView                                     from '@/renderer/views/settings/index.vue';
import { useLayoutStore }                               from '@/renderer/store/modules/layout.js';
import dialogHelper                                     from '@/renderer/components/dialog/index.js'

import donateImage                                      from '@/renderer/assets/donate.png';
import devtoolsIcon                                     from '@/renderer/assets/devtools.svg';


export default {
    components: {
        AppIcon,
        ddmIcon,
        AppIconButton,
        AppDivider,
        AppIconGroup,
        AppTabs,
    },
    data() {
        return {
            layoutStore: useLayoutStore(),
            devtoolsIcon,
            donateImage,
            
            isMaximized: false,
            readyMenuSet: new WeakSet(),
            showDonatePanel: false,
        };
    },
    computed: {
        isMac() {
            return !!(window.constant && window.constant.IS_MAC);
        },

        /**
         * 主页的 tab
         */
        homeTab(){
            return {
                id: "HOME",
                label: this.$t('menu.home'),
                component: 'projectList',
            };
        },

        /**
         * 是否只有主页
         */
        onlyHomeTab(){
            return this.layoutStore.tabList.length === 0;
        },
    },
    watch: {
        'layoutStore.toolbarMenuList'() {
            this.initToolbarMenuList();
        },
    },
    mounted() {
        // 通知已经打开了主页
        this.$emit('open-page', this.homeTab);

        this.initToolbarMenuList();

        // 监听窗口是否为最大化
        this.closeWindowListener = appIpc.on('window-maximized-status', (isMaximized) => this.isMaximized = isMaximized);

        // TODO 方便appRenderer里直接调用打开tab的逻辑，后续可以改成更通用的事件机制
        window.addEventListener('ddm-open-tab', this.handleOpenTab);
    },
    beforeDestroy() {

        // 销毁监听器和事件
        this.closeWindowListener();

        window.removeEventListener('ddm-open-tab', this.handleOpenTab);
    },
    methods: {

        /**
         * 初始化所有 toolbar 的菜单，调用他的ready方法（如果有的话），让它们自己决定要不要做一些初始化工作，比如预加载页面组件等
         */
        initToolbarMenuList(){
            this.layoutStore.toolbarMenuList.forEach((menu) => this.initMenu(menu));
        },

        /**
         * 初始化菜单
         * 可以确保只初始化一次
         */
        initMenu(menu) {
            if (!menu || this.readyMenuSet.has(menu)) {
                return;
            }

            if (!menu.id) {
                this.$set(menu, 'id', `menu-${Math.random()}`);
            }

            this.readyMenuSet.add(menu);

            if (menu.ready) {
                menu.ready(this.$parent || this, menu);
            }
        },

        /**
         * 处理打开 tab 事件
         */
        handleOpenTab(event) {
            if (!event || !event.detail || !event.detail.tab) {
                return;
            }

            this.openTab(event.detail.tab);
        },

        /**
         * 打开一个tab
         * 首先会把这个tab添加到 store 的 tab 列表里（如果还没有的话），然后切换到这个tab对应的页面
         */
        openTab(menu) {
            this.layoutStore.addTab(menu);
            this.openPage(menu);
        },

        /**
         * 打开页面（组件），如果已经存在这个页面了，就会切到这个页面
         */
        openPage(menu) {
            this.initMenu(menu);
            this.$emit('open-page', menu);
        },

        /**
         * 处理排序后的 tabList 
         */
        handleTitlebarTabReorder(reorderTabList) {
            // 1. 拷贝当前 store 里的 tab 列表（避免直接操作 store）
            const currentTabs = this.layoutStore.tabList.slice();

            // 2. 以拖拽后的新顺序为基准，从"原始列表"里找对应的完整 tab 对象
            //    因为 nextTabs 可能是精简数据（只有 id），需要找回完整对象
            const nextOrder = reorderTabList.map((tab) => currentTabs.find((item) => item.id === tab.id)).filter(Boolean);

            // 3. 安全校验：只有新旧数量一致才更新，防止有 tab 丢失的情况下写入脏数据
            if (nextOrder.length === currentTabs.length) {
                this.layoutStore.setTabList(nextOrder);
            }
        },

        /**
         * 打开标签页的右键菜单
         */
        openMenuList(menuInfo) {
            const menuTemplate = [
                {
                    label: this.$t('tab.refresh'),
                    click: async () => this.layoutStore.forceUpdateComponent(menuInfo),
                },
                { type: 'separator' },
                ...(menuInfo.closable ? [{
                    label: this.$t('tab.close'),
                    click: async () => this.layoutStore.closeTab(menuInfo.id),
                }] : []),
                {
                    label: this.$t('tab.closeOther'),
                    click: async () => this.layoutStore.closeOtherTabs(menuInfo),
                },
                {
                    label: this.$t('tab.closeAll'),
                    click: async () => this.layoutStore.closeAllTabs(),
                },
            ];
            appWindow.popupMenu({ template: menuTemplate });
        },

        /**
         * 工具菜单的右键菜单，目前只有刷新功能，后续可以考虑增加一些针对工具菜单的操作
         */
        handleToolbarMenuContextmenu(event, menuInfo) {
            const menuTemplate = [
                {
                    label: this.$t('tab.refresh'),
                    click: async () => this.layoutStore.forceUpdateComponent(menuInfo),
                },
            ];
            appWindow.popupMenu({ template: menuTemplate });
            event.preventDefault();
        },

        /**
         * 处理工具菜单的操作，执行完后关闭菜单
         */
        handleToolsAction(action) {
            action();
            this.showDonatePanel = false;
        },

        /**
         * 打开插件管理页面
         */
        openPlugins() {
            this.openPage({ id: 'plugins', component: 'plugins'});
        },

        /**
         * 以弹框的形式打开设置页面
         */
        openSettings() {
            dialogHelper.openDialog({
                component: settingsView,
                title: this.$t('titlebar.settings'),
                width: 90,
                height: 90,
            });
        },

        openGithub: () => appShell.openExternal('https://github.com/qiaolin-li/dubbo-desktop-manager'),
        openDevTools: () => appWindow.openDevTools(),
        forceReload: () => appWindow.forceReload(),

        /**
         * 窗口控制，最小化，切换，关闭
         */
        minimize: () => appWindow.minimize(),
        toggleMaximize: () => appWindow.toggleMaximize(),
        closeWindow: () => appWindow.close(),
    }
};
</script>

<style scoped>
.app-titlebar {
    position: relative;
    display: flex;
    /* justify-content: space-between; */
    align-items: center;
    width: 100%;
    height: 32px;
    line-height: 32px;
    margin-top: 1px;
    padding: 0;
    background-color: var(--app-theme-titlebar-bg);
    /* border-bottom: 1px solid #e5e5e5; */
    /* box-sizing: border-box; */
    flex-shrink: 0;
    overflow: hidden;
    user-select: none;
    font-size: 13px;
    font-family: var(--app-font-family);
    color: var(--app-theme-text-primary);
}

/* .app-titlebar::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background: #e5e5e5;
    z-index: 0;
} */

/* .app-titlebar * {
    box-sizing: border-box;
} */



.titlebar-left {
    display: inline-flex;
    align-items: center;
    height: 100%;
    min-width: 0;
    padding-left: 3px;
    overflow: hidden;
    z-index: 1;
    flex: 0 0 auto;
    flex-shrink: 0;
}

.titlebar-left-right-border {
    border-right: 1px solid var(--app-theme-titlebar-tab-border);
}

.titlebar-tabs {
    display: flex;
    align-items: center;
    height: 100%;
    flex: 0 1 auto;
    min-width: 0;
    max-width: 45%;
    overflow: hidden;
    z-index: 1;
}

.titlebar-drag-gap {
    min-width: 72px;
    flex: 1 1 auto;
    height: 100%;
}

.titlebar-right {
    display: flex;
    align-items: center;
    height: 100%;
    flex: 0 0 auto;
    justify-content: flex-end;
    z-index: 1;
    flex-shrink: 0;
}


.titlebar-menu-list {
    display: inline-flex;
    align-items: flex-start;
    height: 32px;
    gap: 0;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    /* margin-top: 1px; */
    position: relative;
    z-index: 2;
}

.titlebar-app-icon {
    margin: 6px;
    flex: 0 0 auto;
}

.titlebar-home-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 8px;
    margin: 0;
    border: 1px solid var(--app-theme-titlebar-tab-border);
    border-right: 1px;
    border-top: none;
    border-bottom: none;
    border-radius: 0;
    background: transparent;
    color: var(--app-theme-titlebar-tab-text);
    cursor: pointer;
    font-size: 13px;
    transition: background-color 0.12s ease, color 0.12s ease, border-color 0.12s ease;
}

.titlebar-home-button.active {
    height: 32px;
    margin-bottom: -1px;
    border-color: var(--app-theme-titlebar-tab-border);
    border-radius: 0;
    background-color: var(--app-theme-titlebar-tab-active-bg);
    color: var(--app-theme-titlebar-tab-active-text);
    z-index: 1;
    box-shadow: none;
}

.titlebar-home-button.active::after {
    content: '';
    position: absolute;
    left: 0px;
    right: 0px;
    bottom: 0px;
    height: 2px;
    background-color: #409EFF;
}


.app-tabs-item.is-active {
    background-color: var(--app-theme-titlebar-tab-active-bg);
    color: var(--app-theme-titlebar-tab-active-text);
    border-color: var(--app-theme-titlebar-tab-border);
    box-shadow: inset 0 -4px 0 var(--app-theme-titlebar-tab-active-bg), 0 2px 0 var(--app-theme-titlebar-tab-active-bg);
    z-index : 2;
}


.titlebar-home-icon {
    font-size: 12px;
    flex: 0 0 auto;
}

.titlebar-home-label {
    white-space: nowrap;
}


.titlebar-menu-button {
    position: relative;
    height: 31px;
    max-width: 180px;
    border: 1px solid transparent;
    border-top: none;
    border-bottom: none;
    padding: 0 8px;
    margin: 0;
    border-radius: 0;
    background: transparent;
    color: var(--app-theme-titlebar-tab-text);
    display: inline-flex;
    align-items: center;
    min-width: 0;
    cursor: pointer;
    transition: background-color 0.12s ease, color 0.12s ease, border-color 0.12s ease;
}

.titlebar-menu-button + .titlebar-menu-button {
    margin-left: -1px;
}

.titlebar-app-tabs /deep/ .app-tabs-item.is-active::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 1px;
    background: var(--app-theme-titlebar-tab-active-bg);
    z-index: 3;
}

.titlebar-menu-button:not(.active) {
    border-color: var(--app-theme-titlebar-tab-border);
}

.titlebar-menu-button:hover {
    background-color: var(--app-theme-hover-background);
}

.titlebar-menu-button.active {
    height: 32px;
    margin-bottom: -1px;
    border-color: var(--app-theme-titlebar-tab-border);
    border-radius: 0;
    background-color: var(--app-theme-titlebar-tab-active-bg);
    color: var(--app-theme-titlebar-tab-active-text);
    z-index: 1;
    box-shadow: none;
}

.titlebar-menu-button.active::after {
    content: '';
    position: absolute;
    left: 0px;
    right: 0px;
    bottom: 0px;
    height: 2px;
    background-color: #409EFF;
}

.titlebar-menu-icon {
    font-size: 12px;
    flex-shrink: 0;
}

.titlebar-menu-image-icon {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
}

.titlebar-menu-label {
    margin-left: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.titlebar-menu-close {
    width: 18px;
    height: 18px;
    margin-left: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    flex-shrink: 0;
    opacity: 0;
    visibility: hidden;
    transition: background-color 0.12s ease, opacity 0.12s ease;
}

.titlebar-menu-button:hover .titlebar-menu-close {
    opacity: 1;
    visibility: visible;
}

.titlebar-menu-close:hover {
    background: var(--app-theme-hover-background);
}

.titlebar-menu-close .el-icon-close {
    font-size: 11px;
    transform: scale(0.92);
}

.titlebar-placeholder {
    width: 0;
    height: 100%;
}

.titlebar-right-slot {
    display: inline-flex;
    align-items: center;
    height: 100%;
    flex: 0 0 auto;
    min-width: 0;
    margin-right: 2px;
}

.titlebar-link-list {
    display: inline-flex;
    align-items: center;
    height: 100%;
}

.window-controls {
    display: inline-flex;
    align-items: stretch;
    height: 100%;
    margin-left: 8px;
    position: relative;
}

.window-controls::before {
    content: '';
    position: absolute;
    left: -4px;
    top: 50%;
    width: 1px;
    height: 14px;
    background: var(--app-theme-border);
    transform: translateY(-50%);
}

.window-button {
    width: 40px;
    min-width: 40px;
    border: none;
    padding: 0;
    margin: 0;
    background: transparent;
    color: var(--app-theme-text-primary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.12s ease;
}

.window-button:hover {
    background-color: var(--app-theme-hover-background);
}

.window-button-close:hover {
    background-color: var(--app-theme-window-close-hover-bg);
    color: var(--app-theme-window-close-hover-text);
}

.window-button-line,
.window-button-square,
.window-button-restore,
.window-button-close-icon {
    display: inline-block;
    position: relative;
}

.window-button-line {
    width: 10px;
    height: 1px;
    background: currentColor;
}

.window-button-square {
    width: 10px;
    height: 10px;
    border: 1px solid currentColor;
}

.window-button-restore {
    width: 10px;
    height: 10px;
}

.window-button-restore::before,
.window-button-restore::after {
    content: '';
    position: absolute;
    box-sizing: border-box;
    border: 1px solid currentColor;
    width: 9px;
    height: 8px;
}

.window-button-restore::before {
    top: 2px;
    left: 0;
}

.window-button-restore::after {
    top: 0;
    left: 2px;
    background: var(--app-theme-titlebar-bg);
}

.window-button-close-icon {
    width: 10px;
    height: 10px;
}

.window-button-close-icon::before,
.window-button-close-icon::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 0;
    width: 10px;
    height: 1px;
    background: currentColor;
}

.window-button-close-icon::before {
    transform: rotate(45deg);
}

.window-button-close-icon::after {
    transform: rotate(-45deg);
}

:global(.titlebar-tools-popper) {
    padding: 0 !important;
    border-radius: 8px;
}

.titlebar-tools-menu {
    padding: 6px;
}

.titlebar-tools-item {
    height: 32px;
    padding: 0 5px;
    color: var(--app-theme-text-primary);
    background: transparent;
}

.titlebar-donate-card {
    box-sizing: border-box;
    padding: 4px;
    border-radius: 6px;
    background: var(--app-theme-surface-muted);
    width: 100%;
}

.titlebar-donate-desc {
    margin-top: 6px;
    font-size: 13px;
    line-height: 20px;
    color: var(--app-theme-text-secondary);
}

.titlebar-donate-image {
    display: block;
    width: 100%;
    margin-top: 10px;
    border-radius: 4px;
}
</style>
