<template>
    <div class="tab-panel" :style="panelStyle">
        <div class="tab-panel-header notSelect">
            <div class="tab-panel-nav">
                <button v-for="item in items" :key="item.name" type="button" @click="setActive(item.name)" 
                    class="tab-panel-header-link" :class="{ 'is-active': activeName === item.name }" >
                    {{ item.title }}
                </button>
            </div>
            <div class="tab-panel-toolbar">
                <v-node-renderer v-if="activeItem" :get-nodes="() => activeItem.getToolbarNodes()" />
            </div>
        </div>

        <div class="tab-panel-content">
            <slot></slot>
        </div>
    </div>
</template>

<script>
const VNodeRenderer = {
    name: 'VNodeRenderer',
    props: {
        getNodes: {
            type: Function,
            default: () => [],
        },
    },
    render(h) {
        return h('div', this.getNodes());
    },
};

export default {
    name: 'AppPanel',
    components: {
        VNodeRenderer,
    },
    provide() {
        return {
            appPanels: this,
        };
    },
    props: {
        value: {
            type: String,
            default: '',
        },
        headerHeight: {
            type: Number,
            default: 24,
        },
        headerBackground: {
            type: String,
            default: '#F7F7F7',
        },
    },
    data() {
        return {
            items: [],
            activeName: this.value || '',
        };
    },
    computed: {
        activeItem() {
            return this.items.find(item => item.name === this.activeName) || null;
        },
        panelStyle() {
            const height = Math.max(22, this.headerHeight);
            return {
                '--tab-panel-header-height': `${height}px`,
                '--tab-panel-header-bg': this.headerBackground,
            };
        },
    },
    watch: {
        value(val) {
            this.activeName = val;
        },
    },
    mounted() {
        this.ensureActive();
    },
    methods: {
        /**
         * 注册子面板
         * @param item 子面板组件
         */
        registerItem(item) {
            if (!item || !item.name) {
                throw new Error('[AppTabPanel] tab-panel-item 必须提供有效的 name 属性')
            }
            if (this.items.find(x => x._uid === item._uid)) {
                return;
            }
            this.items.push(item);
        },

        /**
         * 组件销毁时销毁容器
         */
        unregisterItem(item) {
            this.items = this.items.filter(x => x._uid !== item._uid);
            if (this.activeName === item.name) {
                this.ensureActive();
            }
        },

        /**
         * 确保面板被激活
         * 如果使用者绑定了面板，就用使用者绑定的，如果未绑定或者绑定名称错误就激活第一个面板
         */
        ensureActive() {
            if (!this.items.length) {
                return;
            }

            let activeName = this.activeName;

            // 如果么有找到需要激活的面板，那么激活第一个
            if (!this.items.some(item => item.name === this.activeName) && this.items[0]) {
                activeName = this.items[0].name;
            }

            this.setActive(activeName);
        },

        /**
         * 激活面板
         */
        setActive(name) {
            if (!name || this.activeName === name) {
                return;
            }
            this.activeName = name;
            this.$emit('input', name);
            this.$emit('change', name);
        },
    },
};
</script>



<style>
.tab-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    background-color: var(--app-theme-surface);
    border-top: 1px solid var(--app-theme-border);
}

.tab-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--tab-panel-header-height);
    flex: 0 0 var(--tab-panel-header-height);
    min-width: 0;
    overflow: hidden;
    box-sizing: border-box;
    background-color: var(--app-theme-tabs-bg);
    border-bottom: 1px solid var(--app-theme-border);
    gap: 8px;
}

.tab-panel-nav {
    display: flex;
    align-items: center;
    min-width: 0;
    height: 100%;
    flex: 1 1 auto;
    overflow-x: auto;
    overflow-y: hidden;
    padding-left: 12px;
    scrollbar-width: none;
}

.tab-panel-nav::-webkit-scrollbar {
    display: none;
}

.tab-panel-toolbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex: 0 1 auto;
    min-width: 0;
    max-width: 100%;
    height: 100%;
    overflow: hidden;
    padding: 0 10px 0 4px;
    color: var(--app-theme-text-secondary);
}

.tab-panel-header-link {
    position: relative;
    display: inline-flex;
    align-items: center;
    border: 0;
    outline: none;
    background: transparent;
    cursor: pointer;
    margin-right: 18px;
    padding: 0 2px;
    line-height: var(--tab-panel-header-height);
    height: var(--tab-panel-header-height);
    flex: 0 0 auto;
    color: var(--app-theme-text-tertiary);
    font-size: 13px;
    font-weight: 400;
    transition: color .2s ease;
}

.tab-panel-header-link::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 3px;
    border-radius: 2px 2px 0 0;
    background-color: transparent;
    transition: background-color .2s ease;
}

.tab-panel-content {
    flex: 1 1 auto;
    min-height: 0;
    overflow: auto;
}

.tab-panel-header-link.is-active {
    color: var(--app-theme-accent);
}

.tab-panel-header-link.is-active::after {
    background-color: var(--app-theme-accent);
}

.tab-panel-toolbar > div {
    display: inline-flex;
    align-items: center;
    height: 100%;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    gap: 8px;
    line-height: 1;
}
</style>
