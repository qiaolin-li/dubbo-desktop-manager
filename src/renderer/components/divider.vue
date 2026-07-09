<template>
    <span class="app-divider" :class="dividerClass" :style="dividerStyle" aria-hidden="true"></span>
</template>

<script>
export default {
    name: 'AppDivider',
    props: {
        direction: {
            type: String,
            default: 'vertical',
        },
        gap: {
            type: Number,
            default: 4,
        },
        // 自定义颜色，不传则使用主题默认颜色
        color: {
            type: String,
            default: null,
        },
    },
    computed: {
        resolvedDirection() {
            return this.direction === 'horizontal' ? 'horizontal' : 'vertical';
        },
        dividerClass() {
            return `is-${this.resolvedDirection}`;
        },
        dividerStyle() {
            return {
                '--app-divider-margin': this.resolvedDirection === 'horizontal' ? `${this.gap}px 0` : `0 ${this.gap}px`,
                '--app-divider-color': this.color || 'var(--app-theme-border-strong)',
            };
        },
    },
};
</script>

<style scoped>
.app-divider {
    display: inline-block;
    flex-shrink: 0;
    background: var(--app-theme-border-strong);
    margin: var(--app-divider-margin);
}

.app-divider.is-vertical {
    width: 1px;
    height: 14px;
}

.app-divider.is-horizontal {
    display: block;
    width: 100%;
    height: 1px;
}
</style>
