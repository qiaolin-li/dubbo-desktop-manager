<template>
    <div :class="panelClass" :style="panelStyle">
        <slot></slot>
    </div>
</template>

<script>
/**
 * 内容区外层容器：
 * 只负责背景、边框、圆角、留白和填充行为，不负责标题、工具条、操作区等结构语义。
 */
export default {
    name: 'AppContentPanel',
    props: {
        // 内容面的视觉层级：
        // default 普通内容面
        // muted 弱化背景面
        // elevated 更强调的内容面
        // transparent 透明容器
        variant: {
            type: String,
            default: 'default',
        },

        // 内容区内边距，单位 px。
        // 当前也会同步影响组件底部的可见间距；fill 模式下不会额外带出底部外间距。
        padding: {
            type: Number,
            default: 8,
        },
        // 是否显示边框。
        bordered: {
            type: Boolean,
            default: false,
        },
        // 是否显示圆角。
        radius: {
            type: Number,
            default: 0,
        },
        // 是否撑满父容器宽高。
        // 适合拿来包裹完整工作区；开启后会关闭底部额外间距，避免撑满布局时多出空白。
        fill: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        resolvedVariant() {
            return ['default', 'muted', 'elevated', 'transparent'].includes(this.variant) ? this.variant : 'default';
        },
        panelClass() {
            return [
                'app-content-panel',
                `is-${this.resolvedVariant}`,
                {
                    'is-bordered': this.bordered,
                    'is-fill': this.fill,
                }
            ];
        },
        panelStyle() {
            const variantStyleMap = {
                default: {
                    backgroundColor: 'var(--app-theme-surface)',
                },
                muted: {
                    backgroundColor: 'var(--app-theme-panel-muted)',
                },
                elevated: {
                    backgroundColor: 'var(--app-theme-surface-elevated)',
                },
                transparent: {
                    backgroundColor: 'transparent',
                },
            };
            const variantStyle = variantStyleMap[this.resolvedVariant] || variantStyleMap.default;

            return {
                '--app-content-panel-padding': `${this.padding}px`,
                '--app-content-panel-outer-bg': variantStyle.backgroundColor,
                '--app-content-panel-radius': `${this.radius}px`,
            };
        },
    },
};
</script>

<style scoped>
.app-content-panel {
    display: flex;
    flex-direction: column;
    padding: var(--app-content-panel-padding);
    min-width: 0;
    background-color: var(--app-content-panel-outer-bg);
    color: var(--app-theme-text-primary);
    box-sizing: border-box;
    overflow: visible;
    border-radius: var(--app-content-panel-radius);
}


.app-content-panel.is-fill {
    width: 100%;
    height: 100%;
}

.app-content-panel.is-bordered {
    border: 1px solid var(--app-theme-border);
}

</style>
