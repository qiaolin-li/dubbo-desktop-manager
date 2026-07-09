<template>
    <el-tree ref="tree" class="app-tree notSelect" :class="resolvedTreeClass" v-bind="$attrs" v-on="forwardListeners" :data="data" :indent="resolvedIndent"
        :props="props" :node-key="nodeKey" :default-expanded-keys="innerExpandedKeys" :highlight-current="highlightCurrent" 
        @node-click="handleNodeClick" @node-contextmenu="handleNodeContextmenu" @node-expand="handleNodeExpand" @node-collapse="handleNodeCollapse">
        <template slot-scope="scope">
            <slot v-bind="scope">
                <span>{{ getNodeLabel(scope) }}</span>
            </slot>
        </template>
    </el-tree>
</template>

<script>
export default {
    name: 'AppTree',
    inheritAttrs: false, // 禁止自动继承属性，由 $attrs 手动透传给 el-tree
    props: {

        /** 树形数据源 */
        data: {
            type: Array,
            default: () => [],
        },

        /** 节点字段映射配置，默认使用 children/label 字段 */
        props: {
            type: Object,
            default: () => ({
                children: 'children',
                label: 'label',
            }),
        },

        /** 节点唯一标识字段名 */
        nodeKey: {
            type: String,
            default: 'id',
        },

        /** 是否高亮当前选中节点 */
        highlightCurrent: {
            type: Boolean,
            default: false,
        },

        /** 额外的树容器 class，支持字符串、数组、对象写法 */
        treeClass: {
            type: [String, Array, Object],
            default: '',
        },
    },
    data() {
        return {
            // 内部维护的已展开节点 key 列表，初始值来自 prop
            innerExpandedKeys: [],
        };
    },
    computed: {
        /**
         * 计算实际缩进量
         * 优先使用外部传入的 indent，否则根据外观主题给默认值：
         * vscode 风格缩进 10px，默认缩进 18px
         */
        resolvedIndent() {
            if (this.$attrs.indent !== undefined) {
                return this.$attrs.indent;
            }
            return 10;
        },

        /**
         * 计算树容器最终的 class 列表
         * 合并外部传入的 treeClass 与内部主题/图标样式类
         */
        resolvedTreeClass() {
            return [
                this.treeClass,
                {
                    'app-tree--vscode': true,
                    'app-tree--service-icons': true,
                },
            ];
        },

        /**
         * 过滤掉组件内部已处理的事件，避免向 el-tree 重复绑定
         * 被过滤的事件：node-click、node-contextmenu、node-expand、node-collapse
         */
        forwardListeners() {
            const listeners = { ...this.$listeners };
            delete listeners['node-click'];
            delete listeners['node-contextmenu'];
            delete listeners['node-expand'];
            delete listeners['node-collapse'];
            return listeners;
        },
    },
    mounted() {
        const treeRef = this.$refs.tree;
        if (!treeRef) return;

        const allMethods = new Set([
            ...Object.getOwnPropertyNames(Object.getPrototypeOf(treeRef)),
            ...Object.keys(treeRef),
        ]);

        allMethods.forEach(method => {
            if (typeof treeRef[method] === 'function' && method !== 'constructor' && !this[method]) {
                this[method] = (...args) => treeRef[method](...args);
            }
        });
    },
    methods: {
        /**
         * 获取 el-tree 的原生实例引用
         * @returns {object} el-tree 组件实例
         */
        getTreeRef() {
            return this.$refs.tree;
        },

        /**
         * 获取树中所有节点（包含隐藏节点）
         * @returns {Array} 节点对象数组
         */
        getAllNodes() {
            return this.$refs.tree ? this.$refs.tree.store._getAllNodes() : [];
        },

        /**
         * 获取节点显示文本
         * @param {object} scope - 插槽作用域对象，包含 node/data 等信息
         * @returns {string} 节点标签文本，不存在时返回空字符串
         */
        getNodeLabel(scope) {
            return scope?.node?.label ?? '';
        },

        /**
         * 从节点数据中解析出节点唯一 key 值
         * @param {object} data - 节点原始数据
         * @returns {string|number|undefined} 节点 key，数据不存在时返回 undefined
         */
        resolveNodeKey(data) {
            return data?.[this.nodeKey];
        },

        /**
         * 判断指定节点是否处于展开状态
         * @param {object} data - 节点原始数据
         * @returns {boolean} 是否已展开
         */
        isExpanded(data) {
            const key = this.resolveNodeKey(data);
            return key !== undefined && this.innerExpandedKeys.includes(key);
        },

        /**
         * 展开指定节点
         * 若节点 key 不在已展开列表中，则将其加入并同步状态
         * @param {object} data - 节点原始数据
         */
        expandNode(data) {
            const key = this.resolveNodeKey(data);
            if (key === undefined) {
                return;
            }
            this.expand(key);
        },

        /**
         * 展开指定节点
         * @param {string|number} key - 节点 key 值
         */
        expand(key) {
            if (!this.innerExpandedKeys.includes(key)) {
                this.innerExpandedKeys = [...this.innerExpandedKeys, key];
            }

            // 直接操作 el-tree 内部节点，确保视图立即更新
            this.getAllNodes().forEach(item => {
                if (item.data && item.data[this.nodeKey] === key) {
                    item.expanded = true;
                }
            });
        },

        /**
         * 折叠指定节点
         * @param {object} data - 节点原始数据
         */
        collapseNode(data) {
            const key = this.resolveNodeKey(data);
            if (key === undefined) {
                return;
            }

            this.collapse(key);
        },

        /**
         * 折叠指定节点
         * @param {string|number} key - 节点 key 值
         */
        collapse(key) {
            // 直接操作 el-tree 内部节点收起视图
            const node = this.getAllNodes().find(item => item.data?.[this.nodeKey] === key);
            if (!node) return;

            node.expanded = false;

            const excludeKeys = [ key, ...this.getDescendantKeys(node) ];

            this.innerExpandedKeys = this.innerExpandedKeys.filter(item => !excludeKeys.includes(item));
        },

        /**
         * 递归获取指定节点下所有子孙节点的 key
         * @param {object} node - el-tree 内部节点对象
         * @returns {Array} 子孙节点 key 列表
         */
        getDescendantKeys(node) {
            if (!node.childNodes?.length) return [];
            
            return node.childNodes.flatMap(child => [
                child.data[this.nodeKey],
                ...this.getDescendantKeys(child),
            ]);
        },

        locateNode(key) {
            const treeRef = this.$refs.tree;
            if (!treeRef) return;

            const node = treeRef.getNode(key);
            if (!node) return;

            // 收集所有需要展开的祖先 key
            const ancestorNodes = [];
            let parent = node.parent;
            while (parent && parent.data) {
                ancestorNodes.unshift(parent); // 从根到叶排列
                parent = parent.parent;
            }

            // 按顺序逐层展开，每层等待渲染完成再展开下一层
            this.expandSequentially(ancestorNodes, 0, () => {
                treeRef.setCurrentKey(key);
                this.$nextTick(() => {
                    const nodeEl = treeRef.$el.querySelector('.el-tree-node.is-current');
                    nodeEl?.scrollIntoView({ block: 'center' });
                });
            });
        },

        /**
         * 按顺序逐层展开节点，每层等待 DOM 渲染后再处理下一层
         * @param {Array} nodes - 待展开节点列表（从根到叶）
         * @param {number} index - 当前处理的索引
         * @param {Function} done - 全部展开后的回调
         */
        expandSequentially(nodes, index, done) {
            if (index >= nodes.length) {
                done();
                return;
            }

            const node = nodes[index];
            this.expand(node.data[this.nodeKey]);

            this.$nextTick(() => {
                this.expandSequentially(nodes, index + 1, done);
            });
        },

        /**
         * 节点点击事件处理，透传给父组件
         * @param {object} data - 节点原始数据
         * @param {object} node - el-tree 节点对象
         * @param {object} instance - 节点组件实例
         */
        handleNodeClick(data, node, instance) {
            this.$emit('node-click', data, node, instance);
        },

        /**
         * 节点右键菜单事件处理，透传给父组件
         * @param {MouseEvent} event - 原生鼠标事件
         * @param {object} data - 节点原始数据
         * @param {object} node - el-tree 节点对象
         * @param {object} instance - 节点组件实例
         */
        handleNodeContextmenu(event, data, node, instance) {
            this.$emit('node-contextmenu', event, data, node, instance);
        },

        /**
         * 节点展开事件处理
         * 同步内部展开状态后再透传事件给父组件
         * @param {object} data - 节点原始数据
         * @param {object} node - el-tree 节点对象
         * @param {object} instance - 节点组件实例
         */
        handleNodeExpand(data, node, instance) {
            this.expandNode(data);
            this.$emit('node-expand', data, node, instance);
        },

        /**
         * 节点折叠事件处理
         * 同步内部展开状态后再透传事件给父组件
         * @param {object} data - 节点原始数据
         * @param {object} node - el-tree 节点对象
         * @param {object} instance - 节点组件实例
         */
        handleNodeCollapse(data, node, instance) {
            this.collapseNode(data);
            this.$emit('node-collapse', data, node, instance);
        },
    },
};
</script>

<style>
.app-tree {
    height: 100%;
    overflow: auto;
    display: table !important;
    min-width: 100%;
    background: var(--app-tree-bg, transparent);
}

.app-tree::-webkit-scrollbar-corner,
.app-tree::-webkit-resizer {
    background: var(--app-tree-bg, var(--app-theme-sidebar-bg));
}

.app-tree .el-tree-node__content {
    white-space: nowrap;
    display: flex;
    align-items: center;
}

.app-tree--vscode .el-tree {
    background: transparent;
    color: var(--app-theme-text-secondary);
}

.app-tree--vscode {
    --app-tree-bg: var(--app-theme-surface);
    color: var(--app-theme-text-secondary);
}

.app-tree--vscode .el-tree-node__content {
    height: 22px;
    padding-right: 6px;
    border-radius: 0;
    color: var(--app-theme-text-secondary);
    font-size: 13px;
}

.app-tree--vscode .el-tree-node__expand-icon {
    width: 10px;
    height: 10px;
    margin-right: 1px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    vertical-align: top;
}

.app-tree--vscode .el-tree-node__content > .el-tree-node__expand-icon {
    padding: 2px;
}

.app-tree--vscode .el-tree-node__content:hover,
.app-tree--vscode .el-tree-node:focus > .el-tree-node__content {
    background: var(--app-theme-hover-background);
}

.app-tree--vscode .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
    background: var(--app-theme-active-background);
    color: var(--app-theme-text-primary);
}

.app-tree--service-icons .el-tree-node__expand-icon:not(.is-leaf) {
    color: var(--app-theme-service-badge);
}

.app-tree--service-icons .el-tree-node__expand-icon:not(.is-leaf)::before,
.app-tree--service-icons .el-tree .el-icon-caret-right:before {
    content: "\e6e0";
    font-size: 12px;
    color: var(--app-theme-service-badge);
}

.app-tree--service-icons .el-tree-node__expand-icon.is-leaf {
    color: transparent;
}

.app-tree--service-icons .el-tree-node__expand-icon.is-leaf::before,
.app-tree--service-icons .el-tree .is-leaf::before {
    content: "S";
    font-family: Georgia, serif;
    color: var(--app-theme-service-badge);
    border: 1px solid var(--app-theme-service-badge-border);
    width: 11px;
    height: 11px;
    text-align: center;
    line-height: 1;
    font-size: 10px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-left: 2px;
    margin-right: 2px;
    vertical-align: top;
    flex: 0 0 auto;
    box-sizing: border-box;
    background: transparent;
}

</style>
