
/**
 * 标签错误边界组件
 * 捕获子组件渲染时的异常，显示友好的错误提示和重试按钮
 * 防止单个插件页面崩溃影响整个应用
 */
const TabErrorBoundary = {
    name: "TabErrorBoundary",
    props: {
        label: {
            type: String,
            default: "",
        },
    },
    data() {
        return {
            // 捕获到的错误信息，null 表示正常
            error: null,
        };
    },
    methods: {
        // 判断是否是组件缺失类型的错误（插件未注册、加载失败等）
        isMissingComponentError(error) {
            const message = error?.message ?? "";
            return [
                "Unknown custom element",
                "Failed to mount component",
                "render function not defined",
                "Async component loader resolved to undefined",
                "Cannot find module",
                "Cannot find component",
            ].some(keyword => message.indexOf(keyword) >= 0);
        },
    },

    /**
     * Vue 错误捕获钩子，捕获子组件抛出的错误
     */
    errorCaptured(error, vm, info) {
        const componentName = vm?.$options?.name ?? "";
        console.error("tab render error", componentName, error, info);
        // 只处理组件缺失类的错误，其他错误继续向上冒泡
        if (this.isMissingComponentError(error, info)) {
            this.error = { error, info };
        }
        // 返回 false 阻止错误继续向上传播
        return false;
    },
    render(h) {
        // 正常状态：直接渲染插槽内容
        if (!this.error) {
            return h("div", { class: "page-tab-boundary" }, this.$slots.default);
        }

        // 错误状态：显示错误提示和重试按钮
        const message = this.error.error?.message ?? "未知错误";
        const label = this.label || (this.tab?.label ? `插件页面渲染失败：${this.tab.label}` : "插件页面渲染失败");
        return h("div", { class: "page-tab-boundary page-tab-error" }, [
            h("div", { class: "page-tab-error-title" }, label),
            h("div", { class: "page-tab-error-message" }, message),
            h("button", {
                class: "page-tab-error-action",
                attrs: { type: "button" },
                on: {
                    click: () => this.$emit("retry"),
                },
            }, "重新加载"),
        ]);
    },
};

export default TabErrorBoundary;