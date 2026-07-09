<template>
    <div class="app-sidebar" ondragstart="return false">
        <app-icon-group direction="column" :size="34" :gap="8" tooltip-placement="right-start">
            <app-icon-button
                v-for="menu in layoutStore.sidebarTopMenuList"
                :key="menu.id"
                :active="layoutStore.currentPage.id == menu.id"
                :tooltip="menu.label"
                :icon-class="menu.icon"
                @click="$emit('open-page', menu)"
                @contextmenu="handleMenuContextmenu($event, menu)"
            />
        </app-icon-group>
        <app-icon-group
            direction="column"
            :size="34"
            :gap="8"
            tooltip-placement="right-start"
            class="ddm-bottom-menu-list"
        >
            <app-icon-button
                v-for="menu in layoutStore.sidebarBottomMenuList"
                :key="menu.id"
                :active="layoutStore.currentPage.id == menu.id"
                :tooltip="menu.label"
                :icon-class="menu.icon"
                @click="$emit('open-page', menu)"
                @contextmenu="handleMenuContextmenu($event, menu)"
            />
        </app-icon-group>
    </div>
</template>

<script>
import AppIconButton        from "@/renderer/components/button/icon-button.vue";
import AppIconGroup         from "@/renderer/components/app-icon-group.vue";
import { appWindow }          from "@/renderer/core/AppRenderer.js";
import { useLayoutStore }   from "@/renderer/store/modules/layout.js";

export default {
    components: {
        AppIconButton,
        AppIconGroup,
    },
    props: {
        mainPanel: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            layoutStore: useLayoutStore(),
            readyMenuSet: new WeakSet(),
        };
    },
    watch: {
        // 插件临时注册菜单按钮
        "layoutStore.sidebarTopMenuList"(menuList) {
            this.initSidebarMenuList(menuList);
        },
        "layoutStore.sidebarBottomMenuList"(menuList) {
            this.initSidebarMenuList(menuList);
        },
    },
    mounted() {
        this.initSidebarMenuList(this.layoutStore.sidebarTopMenuList);
        this.initSidebarMenuList(this.layoutStore.sidebarBottomMenuList);
    },
    methods: {
        /**
         * 初始化菜单，如果菜单注册时提供了ready方法，调用它
         * @param menuList 菜单列表
         */
        initSidebarMenuList(menuList) {
            menuList.forEach((menu) => this.initMenu(menu));
        },

        initMenu(menu) {
            if (!menu || this.readyMenuSet.has(menu)) {
                return;
            }

            if (!menu.id) {
                this.$set(menu, "id", `menu-${Math.random()}`);
            }

            this.readyMenuSet.add(menu);

            if (menu.ready) {
                menu.ready(this.mainPanel, menu);
            }
        },

        /**
         * 菜单上下文菜单
         * @param event 右键事件
         * @param menuInfo 菜单信息对象
         */
        handleMenuContextmenu(event, menuInfo) {
            const menuTemplate = [
                {
                    label: this.$t("tab.refresh"),
                    click: async () =>
                        this.layoutStore.forceUpdateComponent(menuInfo),
                },
                // { type: 'separator' },
                // ...(menuInfo.closable ? [{
                //     label: this.$t('tab.close'),
                //     click: async () => this.removeMenu(menuInfo)
                // }] : []),
                // {
                //     label: this.$t('tab.closeOther'),
                //     click: async () => this.removeOtherMenu(menuInfo)
                // },
                // {
                //     label: this.$t('tab.closeAll'),
                //     click: async () => this.removeAllMenu(menuInfo)
                // }
            ];
            event.preventDefault();
            appWindow.popupMenu({ template: menuTemplate });
        },
    },
};
</script>

<style>
.app-sidebar {
    flex: 0 0 36px;
    width: 36px;
    min-width: 36px;
    max-width: 36px;
    height: 100%;
    align-items: center;
    background-color: var(--app-theme-sidebar-bg);
    box-shadow: inset -1px 0 0 var(--app-theme-border);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.app-sidebar .app-icon-button {
    -webkit-user-drag: none;
    --app-icon-button-color: var(--app-theme-text-tertiary);
    --app-icon-button-hover-background: var(--app-theme-hover-background);
    --app-icon-button-active-background: var(--app-theme-accent-soft);
    --app-icon-button-active-color: var(--app-theme-accent);
}
</style>
