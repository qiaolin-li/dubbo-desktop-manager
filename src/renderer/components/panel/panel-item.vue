<template>
    <div v-show="isActive" class="tab-panel-item">
        <slot></slot>
    </div>
</template>

<script>
export default {
    name: 'AppPanelItem',
    inject: {
        appPanels: {
            default: null,
        },
    },
    props: {
        name: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
    },
    computed: {
        isActive() {
            return this.appPanels && this.appPanels.activeName === this.name;
        },
    },
    mounted() {
        if (this.appPanels) {
            this.appPanels.registerItem(this);
        }

        if (this.isActive) {
            this.notifyShow();
        }
    },
    beforeDestroy() {
        if (this.appPanels) {
            this.appPanels.unregisterItem(this);
        }
    },
    watch: {
        isActive(value) {
            if (value) {
                this.notifyShow();
            }
        },
    },
    methods: {
        getToolbarNodes() {
            return this.$slots.toolbar || [];
        },
        notifyShow() {
            this.$nextTick(() => {
                this.$emit('show');
            });
        },
    },
};
</script>

<style>
.tab-panel-item {
    height: 100%;
}
</style>
