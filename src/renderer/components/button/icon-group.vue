<template>
    <div class="app-icon-group" :class="groupClass" :style="groupStyle">
        <slot></slot>
    </div>
</template>

<script>
export default {
    name: 'AppIconGroup',
    props: {
        align: {
            type: String,
            default: 'center',
        },
        direction: {
            type: String,
            default: 'row',
        },
        gap: {
            type: Number,
            default: 0,
        },
        size: {
            type: Number,
            default: null,
        },
        tooltipPlacement: {
            type: String,
            default: 'bottom',
        },
    },
    provide() {
        return {
            appIconGroup: this,
        };
    },
    computed: {
        groupClass() {
            return [`is-${this.direction}`];
        },
        groupStyle() {
            return {
                '--app-icon-group-gap': `${this.gap}px`,
                '--app-icon-group-align': this.align,
            };
        },
    },
};
</script>

<style scoped>
.app-icon-group {
    display: inline-flex;
    align-items: var(--app-icon-group-align);
}

.app-icon-group.is-row {
    flex-direction: row;
    gap: var(--app-icon-group-gap);
}

.app-icon-group.is-column {
    flex-direction: column;
    gap: var(--app-icon-group-gap);
}
</style>
