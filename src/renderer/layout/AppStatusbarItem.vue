<template>
    <el-popover v-if="hasPopover" v-model="popoverVisible" placement="top" trigger="manual">
        <div class="app-statusbar-item-popover" @mouseenter="clearHideTimer" @mouseleave="scheduleHidePopover"  :style="statusbarItemStyle">
            <component :is="item.popoverComponent" v-bind="popoverProps" :item="item" />
        </div>
        <button slot="reference" class="app-statusbar-item" type="button"
            :class="{ 'app-statusbar-item-warning': item.warning, 'app-statusbar-item-clickable': clickable}"
            :title="item.tooltip" :disabled="item.disabled"
            @click="handleClick" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
            <app-icon v-if="item.icon" :icon-class="item.icon" :size="14" class="app-statusbar-item__icon" />
            <span v-if="item.text" class="app-statusbar-item__text">{{ item.text }}</span>
        </button>
    </el-popover>
    <button v-else class="app-statusbar-item" 
        :class="{ 'app-statusbar-item-warning': item.warning,  'app-statusbar-item-clickable': clickable}"
        type="button" :title="item.tooltip" :disabled="item.disabled" @click="handleClick">
        <app-icon v-if="item.icon" :icon-class="item.icon" :size="14" class="app-statusbar-item__icon" />
        <span v-if="item.text" class="app-statusbar-item__text">{{ item.text }}</span>
    </button>
</template>

<script>
export default {
    name: "AppStatusBarItem",
    props: {
        item: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            popoverVisible: false,
            hideTimer: null,
        };
    },
    computed: {
        clickable() {
            return !this.item.disabled;
        },
        hasPopover() {
            return !!(this.item.popoverComponent);
        },
        popoverProps() {
            return this.item.popoverParams || {};
        },

        statusbarItemStyle() {
            if(!this.item.popoverHeight) {
                return {};
            }
            
            return {
                height: `${this.item.popoverHeight}px`,
            };
        },
    },
    beforeDestroy() {
        this.clearHideTimer();
    },
    methods: {
        handleClick() {
            if (this.item.disabled) {
                return;
            }

            if (this.hasPopover) {
                this.clearHideTimer();
                this.popoverVisible = true;
            }

            if (this.item.click) {
                this.item.click();
            }
        },
        handleMouseEnter() {
            if (!this.hasPopover) {
                return;
            }

            this.clearHideTimer();
            this.popoverVisible = true;
        },
        handleMouseLeave() {
            if (!this.hasPopover) {
                return;
            }

            this.scheduleHidePopover();
        },
        scheduleHidePopover() {
            this.clearHideTimer();
            this.hideTimer = setTimeout(() => {
                this.popoverVisible = false;
                this.hideTimer = null;
            }, 120);
        },
        clearHideTimer() {
            if (!this.hideTimer) {
                return;
            }

            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        },
    }
};
</script>

<style scoped>
.app-statusbar-item {
    border: none;
    padding: 0 6px;
    margin: 0;
    min-width: 0;
    height: 100%;
    background: transparent;
    font-size: 11px;
    color: var(--app-theme-statusbar-text);
    line-height: 24px;
    letter-spacing: 0.01em;
    font-weight: 400;
    opacity: 0.92;
    user-select: none;
    -webkit-user-select: none;
    transition: background-color 0.12s ease, color 0.12s ease;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.app-statusbar-item-clickable {
    cursor: pointer;
}

.app-statusbar-item:hover {
    background-color: var(--app-theme-statusbar-hover-bg);
    color: var(--app-theme-statusbar-hover-text);
}

.app-statusbar-item-warning {
    color: var(--app-theme-statusbar-warning);
}

.app-statusbar-item:disabled {
    cursor: default;
    opacity: 0.68;
}

.app-statusbar-item:focus {
    outline: none;
}

.app-statusbar-item-popover {
    height: var(--app-statusbar-item-popover-height);
    /* width: var(--app-statusbar-item-popover-width); */
    max-width: 700px;
    max-height: 500px;
    overflow: auto;
}


.app-statusbar-item__icon {
    color: currentColor;
}


.app-statusbar-item__text {
    font-size: 14px;
}
</style>
