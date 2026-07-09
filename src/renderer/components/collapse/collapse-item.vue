<template>
	<div class="app-collapse-item" :style="itemStyle">
		<!-- 拖动条 -->
		<div v-if="showResizer" class="app-collapse-item-resizer" :class="{'is-dragging': isDragging }" @mousedown.stop="onResizerMouseDown"></div>

		<!-- 头部，主要显示面板名称和工具栏 -->
		<div class="app-collapse-item-header notSelect" :style="headerStyle" @click="handleHeaderClick">
			<div class="app-collapse-item-header-main">
				<i v-if="collapsible" :class="isCollapsed ? 'el-icon-arrow-right' : 'el-icon-arrow-down'" class="app-collapse-item-expand-icon"></i>
				<slot name="title">{{ title }}</slot>
			</div>
			<div class="app-collapse-item-toolbar" @click.stop>
				<slot name="toolbar"></slot>
			</div>
		</div>

		<!-- 内容区，如果是展开的才可见 -->
		<div v-show="!isCollapsed" class="app-collapse-item-content">
			<slot></slot>
		</div>
	</div>
</template>

<script>
export default {
	name: "AppCollapseItem",
	inject: [
		"collapseRoot"
	],
	props: {
		/** 标题插槽未传入时显示的默认标题文本 */
		title: {
			type: String,
			default: "",
		},

		/** 子项默认展开高度 */
		defaultHeight: {
			type: Number,
			default: 200,
		},

		/** 拖拽调整时允许的最小高度 */
		minHeight: {
			type: Number,
			default: 120,
		},

		/** 是否允许点击头部进行折叠和展开 */
		collapsible: {
			type: Boolean,
			default: true,
		},

		/** 初始是否为折叠状态 */
		collapsed: {
			type: Boolean,
			default: false,
		},

		/** 头部区域固定高度 */
		headerHeight: {
			type: Number,
			default: 22,
		},
	},
	data() {
		return {
			/**
			 * 当前子面板是否已折叠
			 * 子项内部维护的折叠状态，用于支持自身切换
			 */
			isCollapsed: this.collapsed,
		};
	},
	computed: {
		/**
		 *  computed 里改为依赖父组件的 isDragging
		 */
		isDragging() {
			void this.collapseRoot.layoutVersion;
			return this.collapseRoot._activeItemId === this._uid;
		},
		itemStyle() {
			const layoutVersion = this.collapseRoot.layoutVersion;
			void layoutVersion;

			if (this.isCollapsed) {
				return {
					flex: "0 0 " + this.headerHeight + "px",
				};
			}

			return {
				flex: "0 0 " + this.collapseRoot.getRenderedItemHeight(this._uid, this.defaultHeight) + "px",
			};
		},
		showResizer() {
			const layoutVersion = this.collapseRoot.layoutVersion;
			void layoutVersion;
			return this.collapseRoot.hasResizer(this._uid);
		},
		headerStyle() {
			return {
				height: this.headerHeight + "px",
				flex: "0 0 " + this.headerHeight + "px",
				cursor: this.collapsible ? "pointer" : "default",
			};
		},
	},
	watch: {
		collapsed(value) {
			this.collapseRoot.setItemCollapsed(this, value);
		},
	},
	mounted() {
		this.collapseRoot.registerItem(this);
		this.collapseRoot.setItemHeight(this._uid, this.defaultHeight);
	},
	beforeDestroy() {
		this.collapseRoot.unregisterItem(this._uid);
	},
	methods: {
		/**
		 * 点击头部时切换当前子项的折叠状态。
		 */
		handleHeaderClick() {
			if (!this.collapsible) {
				return;
			}
			const collapsed = this.collapseRoot.toggleItem(this);
			this.$emit("collapse-change", collapsed);
		},
		// 分隔条按下，直接交给父组件处理
		onResizerMouseDown(event) {
			this.collapseRoot.startResize(event, this._uid);
		},
	},
};
</script>

<style>
.app-collapse-item {
	display: flex;
	flex-direction: column;
	min-height: 0;
	overflow: hidden;
}

.app-collapse-item-header {
	display: flex;
	justify-content: space-between;
	flex-direction: row;
	align-items: center;
	background-color: var(--app-theme-surface);
	padding-left: 3px;
	padding-right: 5px;
	font-weight: bold;
	font-size: 14px;
	color: var(--app-theme-text-primary);
	border-bottom: 1px solid var(--app-theme-border);
}

.app-collapse-item-header-main {
	display: flex;
	align-items: center;
	min-width: 0;
}

.app-collapse-item-toolbar {
	display: flex;
	align-items: center;
	flex-shrink: 0;
}

.app-collapse-item-content {
	overflow: auto;
	height: 100%;
	min-height: 0;
	flex: 1 1 auto;
	background: var(--app-theme-surface);
}

.app-collapse-item-resizer {
	box-sizing: border-box;
	width: 100%;
	height: 7px;
	margin: -3px 0;
	border-top: 3px solid rgba(255, 255, 255, 0);
	border-bottom: 3px solid rgba(255, 255, 255, 0);
	background: var(--app-theme-splitter);
	background-clip: padding-box;
	cursor: row-resize;
	flex: 0 0 auto;
	position: relative;
	z-index: 1;
}

.app-collapse-item-resizer:hover,
.app-collapse-item-resizer.is-dragging {
	background-color: var(--app-theme-splitter-hover);
	opacity: 0.8;
}

.app-collapse-item-expand-icon {
	padding-right: 3px;
}
</style>
