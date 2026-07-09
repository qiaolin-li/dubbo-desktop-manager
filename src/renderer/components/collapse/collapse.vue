<template>
    <div ref="container" class="app-collapse">
        <slot></slot>

        <!-- 拖动时全屏遮罩，加了这个鼠标就不会被其他元素干扰了，比如说鼠标移动到有tooltip上会有提示，加了这个就不会了 -->
        <div v-if="isDragging" class="collapse-drag-mask"></div>
    </div>
</template>

<script>
export default {
    name: 'AppCollapse',
    provide() {
        return {
            collapseRoot: this,
        };
    },
    data() {
        return {
            /** 已注册的子项组件列表，顺序与当前渲染顺序一致。 */
            items: [],

            /** 子项期望高度缓存，key 为子项 uid。记录用户调整后的目标高度。 */
            itemHeightMap: {},

            /** 子项实际渲染高度缓存，key 为子项 uid。驱动子项的实际 flex 尺寸。 */
            renderedItemHeightMap: {},

            /** 子项状态变化后递增，子项通过 computed 依赖它来触发重新计算。 */
            layoutVersion: 0,

            // 是否正在拖拽，用于显示遮罩和全局 cursor
            isDragging: false,
        };
    },
    created() {
        // 拖拽相关状态不需要响应式，直接挂到实例上
        this._activeItemId = null;
        this._startY = 0;
        this._startHeightMap = null;
    },
    beforeDestroy() {
        this.stopResize();
    },
    methods: {
        // ─── 子项注册 ────────────────────────────────────────────

        /**
         * 注册子项，由子项在 mounted 时调用。
         * @param {Vue} item 子项组件实例
         */
        registerItem(item) {
            if (this.items.find((x) => x._uid === item._uid)) {
                return;
            }
            this.items.push(item);
            this._ensureItemHeightState(item);
            this.$nextTick(() => this.rebalanceLayout());
        },

        /**
         * 注销子项，由子项在 beforeDestroy 时调用。
         * @param {number} itemId 子项组件 uid
         */
        unregisterItem(itemId) {
            this.items = this.items.filter((x) => x._uid !== itemId);
            delete this.itemHeightMap[itemId];
            delete this.renderedItemHeightMap[itemId];
            this.$nextTick(() => this.rebalanceLayout());
        },

        // ─── 工具方法 ────────────────────────────────────────────

        /**
         * 确保子项拥有初始的期望高度和渲染高度。
         * @param {Vue} item 子项组件实例
         */
        _ensureItemHeightState(item) {
            if (!(item._uid in this.itemHeightMap)) {
                this.$set(this.itemHeightMap, item._uid, item.defaultHeight);
            }
            if (!item.isCollapsed && !(item._uid in this.renderedItemHeightMap)) {
                this.$set(this.renderedItemHeightMap, item._uid, this.itemHeightMap[item._uid]);
            }
        },

        /**
         * 按当前 DOM 顺序返回子项列表。
         * @returns {Vue[]}
         */
        getOrderedItems() {
            return this.items.slice().sort((a, b) => {
                if (!a.$el || !b.$el || !this.$refs.container) return 0;
                const children = Array.from(this.$refs.container.children);
                return children.indexOf(a.$el) - children.indexOf(b.$el);
            });
        },

        /**
         * 返回当前展开状态的子项列表。
         * @returns {Vue[]}
         */
        getExpandedItems() {
            return this.getOrderedItems().filter((item) => !item.isCollapsed);
        },

        /**
         * 返回指定子项上方所有已展开的子项。
         * @param {number} itemId
         * @returns {Vue[]}
         */
        _getExpandedItemsBefore(itemId) {
            const ordered = this.getOrderedItems();
            const index = ordered.findIndex((x) => x._uid === itemId);
            if (index <= 0) return [];
            return ordered.slice(0, index).filter((x) => !x.isCollapsed);
        },

        /**
         * 返回指定子项上方最近的已展开子项。
         * @param {number} itemId
         * @returns {Vue|null}
         */
        getPreviousExpandedItem(itemId) {
            const items = this._getExpandedItemsBefore(itemId);
            return items.length > 0 ? items[items.length - 1] : null;
        },

        /**
         * 返回指定子项下方最近的已展开子项。
         * @param {number} itemId
         * @returns {Vue|null}
         */
        getNextExpandedItem(itemId) {
            const ordered = this.getOrderedItems();
            const index = ordered.findIndex((x) => x._uid === itemId);
            if (index < 0) return null;
            for (let i = index + 1; i < ordered.length; i++) {
                if (!ordered[i].isCollapsed) return ordered[i];
            }
            return null;
        },

        /**
         * 获取容器当前高度。
         * @returns {number}
         */
        _getContainerHeight() {
            return this.$refs.container ? this.$refs.container.clientHeight : 0;
        },

        /**
         * 获取子项期望高度。
         * @param {number} itemId
         * @param {number} defaultHeight
         * @returns {number}
         */
        getItemHeight(itemId, defaultHeight) {
            return this.itemHeightMap[itemId] || defaultHeight;
        },

        /**
         * 获取子项当前实际渲染高度。
         * @param {number} itemId
         * @param {number} defaultHeight
         * @returns {number}
         */
        getRenderedItemHeight(itemId, defaultHeight) {
            return this.renderedItemHeightMap[itemId] || this.getItemHeight(itemId, defaultHeight);
        },

        /**
         * 保存子项期望高度。
         * @param {number} itemId
         * @param {number} height
         */
        setItemHeight(itemId, height) {
            this.$set(this.itemHeightMap, itemId, height);
        },

        /**
         * 保存渲染高度映射并触发布局刷新。
         * @param {Object} heightMap
         */
        _setRenderedItemHeightMap(heightMap) {
            this.renderedItemHeightMap = heightMap;
            this.layoutVersion += 1;
        },

        /**
         * 返回当前展开子项的渲染高度映射副本。
         * @returns {Object}
         */
        _createRenderedHeightMap() {
            const map = {};
            this.getExpandedItems().forEach((item) => {
                map[item._uid] = this.getRenderedItemHeight(item._uid, item.defaultHeight);
            });
            return map;
        },

        /**
         * 计算当前布局总占用高度。
         * @param {Object} heightMap
         * @returns {number}
         */
        _getOccupiedHeight(heightMap) {
            return this.getOrderedItems().reduce((total, item) => {
                return total + (item.isCollapsed ? item.headerHeight : (heightMap[item._uid] || item.defaultHeight));
            }, 0);
        },

        /**
         * 让上方已展开子项按从近到远顺序让出高度。
         * @param {number} itemId
         * @param {number} requiredHeight 需要腾出的高度
         * @param {Object} heightMap
         * @param {boolean} syncDesiredHeight 是否同步更新期望高度
         * @returns {number} 实际腾出的高度
         */
        _takeHeightFromPreviousItems(itemId, requiredHeight, heightMap, syncDesiredHeight) {
            let remaining = requiredHeight;
            const previousItems = this._getExpandedItemsBefore(itemId).slice().reverse();

            previousItems.forEach((item) => {
                if (remaining <= 0) return;
                const current = heightMap[item._uid];
                const next = Math.max(item.minHeight, current - remaining);
                const decreased = current - next;
                if (decreased <= 0) return;
                heightMap[item._uid] = next;
                remaining -= decreased;
                if (syncDesiredHeight) {
                    this.setItemHeight(item._uid, next);
                }
            });

            return requiredHeight - remaining;
        },

        // ─── 布局管理 ────────────────────────────────────────────

        /**
         * 重新平衡布局，确保所有子项高度之和等于容器高度。
         * 空余空间优先给 preferredItemId 指定的子项，否则给第一个展开子项。
         * 空间不足时从最下方展开子项开始回收高度。
         * @param {number} [preferredItemId] 优先分配空余空间的子项 uid
         */
        rebalanceLayout(preferredItemId) {
            const containerHeight = this._getContainerHeight();
            const expandedItems = this.getExpandedItems();

            if (containerHeight <= 0 || expandedItems.length === 0) {
                this._setRenderedItemHeightMap({});
                return;
            }

            const heightMap = {};
            expandedItems.forEach((item) => {
                this._ensureItemHeightState(item);
                heightMap[item._uid] = this.getRenderedItemHeight(item._uid, item.defaultHeight);
            });

            const diff = containerHeight - this._getOccupiedHeight(heightMap);

            if (diff > 0) {
                // 有剩余空间，优先给指定子项，否则给第一个
                const target = expandedItems.find((x) => x._uid === preferredItemId) || expandedItems[0];
                heightMap[target._uid] += diff;
            } else if (diff < 0) {
                // 空间不足，从最下方开始回收
                let overflow = -diff;
                expandedItems.slice().reverse().forEach((item) => {
                    if (overflow <= 0) return;
                    const current = heightMap[item._uid];
                    const next = Math.max(item.minHeight, current - overflow);
                    const decreased = current - next;
                    if (decreased <= 0) return;
                    heightMap[item._uid] = next;
                    overflow -= decreased;
                });
            }

            this._setRenderedItemHeightMap(heightMap);
        },

        // ─── 折叠切换 ────────────────────────────────────────────

        /**
         * 切换子项折叠状态。
         * @param {Vue} item
         * @returns {boolean} 切换后的折叠状态
         */
        toggleItem(item) {
            const next = !item.isCollapsed;
            this.setItemCollapsed(item, next);
            return next;
        },

        /**
         * 设置子项折叠状态，并重新分配相邻面板高度。
         * 折叠时：释放的高度优先给上一个展开子项。
         * 展开时：优先从上方子项借空间。
         * @param {Vue} item
         * @param {boolean} collapsed
         */
        setItemCollapsed(item, collapsed) {
            if (item.isCollapsed === collapsed) return;

            this._ensureItemHeightState(item);
            const heightMap = this._createRenderedHeightMap();

            if (collapsed) {
                // 折叠：把释放的高度给上一个（或下一个）展开子项
                const released = Math.max(0, this.getRenderedItemHeight(item._uid, item.defaultHeight) - item.headerHeight);
                const recipient = this.getPreviousExpandedItem(item._uid) || this.getNextExpandedItem(item._uid);

                item.isCollapsed = true;
                delete heightMap[item._uid];

                if (recipient) {
                    heightMap[recipient._uid] = (heightMap[recipient._uid] || this.getRenderedItemHeight(recipient._uid, recipient.defaultHeight)) + released;
                }

                this._setRenderedItemHeightMap(heightMap);
                this.$nextTick(() => this.rebalanceLayout(recipient?._uid));
                return;
            }

            // 展开：优先从上方子项借空间
            item.isCollapsed = false;
            const desired = this.getItemHeight(item._uid, item.defaultHeight);
            const required = Math.max(0, desired - item.headerHeight);
            const taken = this._takeHeightFromPreviousItems(item._uid, required, heightMap, false);

            heightMap[item._uid] = item.headerHeight + taken;
            this._setRenderedItemHeightMap(heightMap);
            this.$nextTick(() => this.rebalanceLayout(item._uid));
        },

        // ─── 分隔条 ──────────────────────────────────────────────

        /**
         * 判断指定子项是否需要显示拖拽分隔条。
         * 第一个子项上方不显示，折叠状态不显示，上方没有展开子项时不显示。
         * @param {number} itemId
         * @returns {boolean}
         */
        hasResizer(itemId) {
            const ordered = this.getOrderedItems();
            const index = ordered.findIndex((x) => x._uid === itemId);
            if (index <= 0) return false;
            const item = this.items.find((x) => x._uid === itemId);
            return Boolean(item && !item.isCollapsed && this.getPreviousExpandedItem(itemId));
        },

        // ─── 拖拽调整高度 ────────────────────────────────────────

        /**
         * 开始拖拽调整高度。
         * 记录起始鼠标位置和各子项高度快照，后续基于快照计算，避免累积误差。
         * @param {MouseEvent} event
         * @param {number} itemId 被拖拽分隔条对应的子项 uid
         */
        startResize(event, itemId) {
            event.preventDefault();
            this._activeItemId = itemId;
            this._startY = event.clientY;
            // 记录拖动开始时的高度快照，避免增量累积误差
            this._startHeightMap = this._createRenderedHeightMap();

            this.isDragging = true;
            // 全局 cursor，鼠标移出分隔条也保持
            document.body.style.cursor = 'ns-resize';
            document.body.style.userSelect = 'none';

            this.layoutVersion += 1; // 触发子项重新计算 isDragging 状态

            window.addEventListener('mousemove', this.handleResize);
            window.addEventListener('mouseup', this.stopResize);
        },

        /**
         * 拖拽过程中实时更新高度。
         * 基于起始快照 + 总位移计算，不用增量，无累积误差。
         * 向上拖：当前子项变高，从上方子项借空间。
         * 向下拖：当前子项变小，空间还给上方子项。
         * @param {MouseEvent} event
         */
        handleResize(event) {
            if (!this._activeItemId) return;

            if (event.buttons === 0 || event.which === 0) {
                this.stopResize();
                return;
            }

            const item = this.items.find((x) => x._uid === this._activeItemId);
            if (!item || item.isCollapsed) {
                this.stopResize();
                return;
            }

            // 基于起始位置计算总位移，避免增量累积误差
            const totalDeltaY = event.clientY - this._startY;
            const heightMap = { ...this._startHeightMap };
            const startHeight = this._startHeightMap[item._uid];

            if (totalDeltaY < 0) {
                // 向上拖：从上方子项依次借空间，当前子项变高
                const previousItems = this._getExpandedItemsBefore(item._uid).slice().reverse();
                let remaining = -totalDeltaY;

                previousItems.forEach((prev) => {
                    if (remaining <= 0) return;
                    const prevStart = this._startHeightMap[prev._uid];
                    const canGive = prevStart - prev.minHeight;
                    const give = Math.min(remaining, canGive);
                    heightMap[prev._uid] = prevStart - give;
                    remaining -= give;
                });

                const actualIncrease = -totalDeltaY - remaining;
                heightMap[item._uid] = startHeight + actualIncrease;
            } else {
                // 向下拖：当前子项变小，空间还给上方相邻子项
                const previousItem = this.getPreviousExpandedItem(item._uid);
                const maxDecrease = startHeight - item.minHeight;
                const actualDecrease = Math.min(totalDeltaY, maxDecrease);

                heightMap[item._uid] = startHeight - actualDecrease;

                if (previousItem) {
                    heightMap[previousItem._uid] = this._startHeightMap[previousItem._uid] + actualDecrease;
                }
            }

            // 同步期望高度，下次展开时恢复用户调整后的尺寸
            Object.keys(heightMap).forEach((uid) => {
                this.setItemHeight(uid, heightMap[uid]);
            });

            this._setRenderedItemHeightMap(heightMap);
        },

        /**
         * 结束拖拽，清理状态和事件监听。
         */
        stopResize() {
            this._activeItemId = null;
            this._startHeightMap = null;

            this.isDragging = false;
            // 恢复全局 cursor
            document.body.style.cursor = '';
            document.body.style.userSelect = '';

            this.layoutVersion += 1; // 触发子项重新计算 isDragging 状态

            window.removeEventListener('mousemove', this.handleResize);
            window.removeEventListener('mouseup', this.stopResize);
        },
    },
};
</script>

<style>
.app-collapse {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    position: relative;
}

/* 拖动时全屏遮罩，确保鼠标事件不被其他元素抢走 */
.collapse-drag-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    cursor: ns-resize;
}
</style>
