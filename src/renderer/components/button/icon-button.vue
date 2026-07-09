<template>
    <el-tooltip v-if="tooltip" effect="light" :content="tooltip" :placement="resolvedTooltipPlacement">
        <div class="app-icon-button notSelect" :class="[{ 'app-icon-button-active': active, 'app-icon-button-disabled': disabled, 'app-icon-button-block': block }]"
            :style="buttonStyle" :disabled="disabled" @click="handleClick" @contextmenu="handleContextmenu">
            <AppIcon :icon-class="iconClass" :imageSrc="imageSrc" :alt="alt" :size="resolvedIconSize">
                <slot></slot>
            </AppIcon>

            <span v-if="text" class="app-icon-buttot_text" >
                {{ text }}
            </span>
        </div>
    </el-tooltip>
    <div v-else  class="app-icon-button notSelect"  :class="[{ 'app-icon-button-active': active, 'app-icon-button-disabled': disabled, 'app-icon-button-block': block }]"
        :style="buttonStyle" :disabled="disabled" @click="handleClick" @contextmenu="handleContextmenu">
        <AppIcon :icon-class="iconClass" :imageSrc="imageSrc" :alt="alt" :size="resolvedIconSize">
            <slot></slot>
        </AppIcon>

        <span v-if="text" class="app-icon-buttot_text" >
            {{ text }}
        </span>
    </div>
</template>

<script>

import AppIcon from '@/renderer/components/button/icon.vue'

const DEFAULT_SIZE = 26;
const DEFAULT_RADIUS = 6;
const DEFAULT_TOOLTIP_PLACEMENT = 'bottom';
const DEFAULT_ICON_SCALE = 0.6;

export default {
    name: 'AppIconButton',
    components: {
        AppIcon
    },
    inject: {
        appIconGroup: {
            default: null,
        },
    },
    props: {
        iconClass: {
            type: String,
            default: '',
        },
        imageSrc: {
            type: String,
            default: '',
        },
        alt: {
            type: String,
            default: '',
        },
        size: {
            type: Number,
            default: null,
        },
        title: {
            type: String,
            default: '',
        },
        tooltip: {
            type: String,
            default: '',
        },
        tooltipPlacement: {
            type: String,
            default: null,
        },
        active: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        block: {
            type: Boolean,
            default: false,
        },

        text: {
            type: String,
            default: '',
        },
    },
    computed: {
        resolvedSize() {
            return this.size || this.appIconGroup?.size || DEFAULT_SIZE;
        },
        resolvedIconSize() {
            const nextSize = Math.max(12, Math.round(this.resolvedSize * DEFAULT_ICON_SCALE));
            return nextSize % 2 === 0 ? nextSize : nextSize + 1;
        },
        resolvedTooltipPlacement() {

            // 优先级 自己的 > 按钮组的 > 默认的
            return this.tooltipPlacement || this.appIconGroup?.tooltipPlacement || DEFAULT_TOOLTIP_PLACEMENT;
        },
        buttonStyle() {
            return {
                '--app-icon-button-size': `${this.resolvedSize}px`,
                '--app-icon-button-radius-default': `${DEFAULT_RADIUS}px`,
                '--app-icon-button-color-default': 'var(--app-theme-text-secondary)',
                '--app-icon-button-hover-background-default': 'var(--app-theme-hover-background)',
                '--app-icon-button-active-background-default': 'var(--app-theme-active-background)',
                '--app-icon-button-active-color-default': 'var(--app-theme-text-primary)',
                '--app-icon-button-effect-inset': `${Math.max(1, Math.round(this.resolvedSize * 0.04))}px`,
            };
        },
    },
    methods: {
        handleClick(event) {
            if (this.disabled) {
                event.preventDefault();
                return;
            }

            this.$emit('click', event);
        },
        handleContextmenu(event) {
            if (this.disabled) {
                event.preventDefault();
                return;
            }

            this.$emit('contextmenu', event);
        },
    },
};
</script>

<style scoped>
.app-icon-button {
    min-width: var(--app-icon-button-size);
    height: var(--app-icon-button-size);
    border-radius: var(--app-icon-button-radius, var(--app-icon-button-radius-default));
    background: transparent;
    color: var(--app-icon-button-color, var(--app-icon-button-color-default));
    cursor: pointer;
    transition: background-color 0.12s ease, color 0.12s ease, opacity 0.12s ease;
    appearance: none;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    gap: 8px;
    
    position: relative;
}

.app-icon-button:hover {
    background: var(--app-icon-button-hover-background, var(--app-icon-button-hover-background-default));
    transition: background-color 0.12s ease, opacity 0.12s ease, transform 0.12s ease;
}

.app-icon-button-active {
    color: var(--app-icon-button-active-color, var(--app-icon-button-active-color-default));
    background: var(--app-icon-button-active-background, var(--app-icon-button-active-background-default));
}

.app-icon-button-disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

.app-icon-button-block {
    width: 100%;
    justify-content: flex-start;
}

.app-icon-buttot_text {
    white-space: nowrap;
    line-height: 1;
}
</style>
