<template>
    <div class="app-statusbar">
        <!-- 左边 statusbar list -->
        <div class="app-statusbar-left">
            <app-statusbar-item v-for="statusbar in leftStatusbarItems" :key="statusbar.id" :item="statusbar" class="app-statusbar-item-component" />
        </div>

        <!-- 右边 status list -->
        <div class="app-statusbar-right">
            <app-statusbar-item v-for="statusbar in rightStatusbarItems" :key="statusbar.id" :item="statusbar" class="app-statusbar-item-component" />
        </div>
    </div>
</template>

<script>
import { useLayoutStore }       from '@/renderer/store/modules/layout.js';
import AppStatusbarItem         from '@/renderer/layout/AppStatusbarItem.vue';

export default {
    name: "AppStatusBar",
    components: {
        AppStatusbarItem,
    },
    data() {
        return {
            layoutStore: useLayoutStore(),
        };
    },
    computed: {
        statusbarItems() {
            return this.layoutStore.statusbarItems || [];
        },
        leftStatusbarItems() {
            return this.statusbarItems.filter(item => item.alignment === 'left' && item.visible !== false);
        },
        rightStatusbarItems() {
            return this.statusbarItems.filter(item => item.alignment === 'right' && item.visible !== false);
        },
    },
    methods: {
    }
};
</script>

<style scoped>
.app-statusbar {
    height: 24px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    box-sizing: border-box;
    background-color: var(--app-theme-statusbar-bg);
    border-top: 1px solid var(--app-theme-statusbar-border);
}


.app-statusbar-left {
    display: flex;
    align-items: center;
    min-width: 0;
    height: 100%;
    flex: 1;
    overflow: hidden;
}

.app-statusbar-right {
    display: flex;
    align-items: center;
    min-width: 0;
    height: 100%;
    justify-content: flex-end;
    flex-shrink: 0;
}

.app-statusbar-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    color: var(--app-theme-statusbar-text);
    font-size: 11px;
}

.app-statusbar-status-icon {
    flex-shrink: 0;
    font-size: 12px;
}

.app-statusbar-status-icon-warning {
    color: var(--app-theme-statusbar-warning);
}

.app-statusbar-status-icon-ok {
    color: var(--app-theme-success);
}

.app-statusbar-status-text {
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.app-statusbar-item-component {
    flex-shrink: 0;
}
</style>
