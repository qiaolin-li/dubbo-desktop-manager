<template>
    <el-dialog :class="{ 'app-dialog--pending': !dialogReady, 'app-dialog--topmost': dialogTopmost }" custom-class="app-dialog"
        :fullscreen="isFullscreen" :title="title" :visible.sync="dialogVisible"
        :width="dialogWidth" :show-close="false" :before-close="hide" :close-on-click-modal="false" :close-on-press-escape="false"
        center :style="dialogStyle" @opened="handleOpened">
        
        <template #title>
            <div class="app-dialog-title">
                <div class="app-dialog-title__main">
                    <ddmIcon :width="20" :height="20" />
                    <span class="el-dialog__title">{{ title }}</span>
                </div>

                <div class="app-dialog-title__actions">
                    <button class="app-dialog-tool-btn" :class="{ 'is-disabled': dialogDisableFullscreen }"
                        :disabled="dialogDisableFullscreen" :title="isFullscreen ? $t('dialog.exitFullscreen') : $t('dialog.fullscreen')"
                        @click.stop="!dialogDisableFullscreen && toggleFullscreen()">
                        <i :class="isFullscreen ? 'el-icon-copy-document' : 'el-icon-full-screen'"></i>
                    </button>
                    <button class="app-dialog-tool-btn" :class="{ 'is-disabled': dialogDisableClose }"
                        :disabled="dialogDisableClose" :title="$t('dialog.close')" @click.stop="!dialogDisableClose && handleCancel('close')">
                        <i class="el-icon-close"></i>
                    </button>
                </div>
            </div>
        </template>

        <!-- eslint-disable-next-line vue/require-component-is -->
        <component ref="dialogComponent" v-bind="componentProps()" />
        
        <span v-if="footerActions.length > 0" slot="footer" class="dialog-footer">
            <el-button v-for="(action, index) in footerActions" :key="index" :type="action.type || 'default'"
                size="mini" @click="handleAction(action)">
                {{ action.text }}
            </el-button>
        </span>
    </el-dialog>
</template>

<script>
import ddmIcon              from '@/renderer/components/ddm-icon.vue'

// 全局已打开的对话框栈，用于判断当前最顶层对话框（处理键盘事件用）
const openedDialogStack = [];

let resizeHandler = null;

function registerGlobalResize() {
    if (resizeHandler) return;
    resizeHandler = () => {
        openedDialogStack.forEach(dialog => {
            dialog.viewportWidth  = window.innerWidth;
            dialog.viewportHeight = window.innerHeight;
            dialog.$nextTick(() => {
                dialog.initDialogPosition();
                dialog.applyDialogState();
            });
        });
    };
    window.addEventListener("resize", resizeHandler);
}

function unregisterGlobalResize() {
    if (openedDialogStack.length > 0) return;
    window.removeEventListener("resize", resizeHandler);
    resizeHandler = null;
}

function updateModalOverlay() {
    const wrappers = document.querySelectorAll(".el-dialog__wrapper");
    wrappers.forEach((wrapper, i, all) => {
        wrapper.style.background = i === all.length - 1 ? "" : "transparent";
    });

    const modals = document.querySelectorAll(".v-modal");
    modals.forEach((modal, i, all) => {
        modal.style.display = i === all.length - 1 ? "" : "none";
    });
}

function updateDialogStackState() {
    const topmostDialog = openedDialogStack.at(-1);
    openedDialogStack.forEach(dialog => {
        dialog.dialogTopmost = dialog === topmostDialog;
        dialog.$nextTick(() => {
            dialog.applyDialogShadowState();
        });
    });
}

export default {
    name: "appDialog",
    components: {
        ddmIcon
    },
    props: {

        /**
         * 对话框内渲染的 Vue 组件
         */
        component: {
            type: [String, Object],
            required: false,
        },

        /** 
         * 传递给内容组件的参数
         */
        params: {
            type: Object,
            required: false,
        },

        /**
         * iframe 模式下的地址
         */
        src: {
            type: String,
            required: false,
        },

        /**
         * 对话框标题
         */
        title: {
            type: String,
            default: "dialog",
        },

        /**
         * 对话框宽度百分比, 默认为80
         */
        width: {
            type: Number,
            default: 80,
            validator(value) {
                return value >= 0 && value <= 100
            }
        },

        /**
         * 对话框高度百分比, 默认为80
         */
        height: {
            type: Number,
            default: 80,
            validator(value) {
                return value >= 0 && value <= 100
            }
        },

        /**
         * 自定义底部按钮列表
         */
        actions: {
            type: Array,
            required: false,
        },

        /**
         * 初始是否全屏
         */
        fullscreen: {
            type: Boolean,
            default: false,
        },

        /**
         * 是否禁用全屏按钮
         */
        disableFullscreen: {
            type: Boolean,
            default: false,
        },


        /**
         * 是否允许 ESC 关闭
         */
        closeOnEsc: {
            type: Boolean,
            default: true,
        },

        /**
         * 是否禁用关闭按钮
         */
        disableClose: {
            type: Boolean,
            default: false,
        },

        /**
         * 是否在 Enter 键时触发主操作按钮
         */
        submitOnEnter: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {

            /** 
             * dialog 是否可见
             */
            dialogVisible: false,

            /** 
             * 内容是否就绪，未就绪时隐藏对话框避免布局闪烁
             */
            dialogReady: false,

            /**
             * 是否是当前最顶层对话框，用于控制只有当前对话框显示阴影
             */
            dialogTopmost: false,

            /**
             * 内容组件动态设置的底部按钮列表
             */
            dialogActions: [],

            /**
             * 是否全屏
             */
            isFullscreen: this.fullscreen,

            /**
             * 以下三个支持运行时通过 updateDialogState 动态修改
             */
            dialogCloseOnEsc: this.closeOnEsc,
            dialogDisableClose: this.disableClose,
            dialogDisableFullscreen: this.disableFullscreen,

            /**
             * 对话框关闭时的返回值和原因
             */
            dialogResult: undefined,
            dialogCloseReason: null,

            viewportWidth: typeof window !== "undefined" ? window.innerWidth : 0,
            viewportHeight: typeof window !== "undefined" ? window.innerHeight : 0,

            // 对话框当前位置 { left, top }
            dialogPosition: null,

        };
    },
    computed: {
        dialogStyle() {
            return { 
                height: this.dialogHeight 
            };
        },

        /**
         * 宽度：优先用传入值，否则视口 80%
         */
        dialogWidth() {
            // 防止用户传递非 number 的值
            const raw = this.width != null ? Number(this.width) : 80;
            const percent = isNaN(raw) ? 80 : Math.min(100, Math.max(0, raw));

            return `${Math.floor(this.viewportWidth * (percent / 100))}px`;
        },
        
        /**
         * 高度：优先用传入值，否则根据视口和底部按钮区动态计算
         */
        dialogHeight() {
            // app 的标题栏
            const appTitlebarHeight = 32;

            // dialog 的标题栏
            const dialogTitlebarHeight = 29;

            // dialog 的底部栏
            const dialogFooterHeight = this.footerActions.length > 0 ? 37 : 0;

            // 防止用户传递非 number 的值
            const raw = this.height != null ? Number(this.height) : 80 ;
            const percent = isNaN(raw) ? 80 : Math.min(100, Math.max(0, raw));

            // 计算出内容的高度
            const contentHeight = Math.floor(
                Math.max(0, this.viewportHeight - appTitlebarHeight - dialogTitlebarHeight - dialogFooterHeight) * (percent / 100)
            );
            return `${contentHeight + dialogTitlebarHeight + dialogFooterHeight}px`;
        },

        /**
         * 底部按钮列表，优先级：actions prop > dialogActions（内容组件设置）> showFooter 默认按钮
         */
        footerActions() {
            const actions = [];

            if (Array.isArray(this.actions) && this.actions.length > 0) {
                actions.push(...this.actions);
            }
            if (this.dialogActions.length > 0) {
                actions.push(...this.dialogActions);
            }

            // 这里按照order来排序 order
            return actions;
        },
        // 主操作按钮（Enter 键触发）
        primaryAction() {
            return this.footerActions.find((action) => action?.role === "confirm" || action?.type === "primary" || action?.primary);
        },
    },
    created() {

        /**  Promise resolve 函数，show() 返回的 Promise 通过它兑现 */
        this.dialogResolve = null;

        /** 对话框句柄，暴露给外部和内容组件 */
        this.dialogHandle = null;

        /** * 打开前记录的焦点元素，关闭后恢复 */
        this.lastActiveElement = null;
        
        // el-dialog 的 DOM 元素引用
        this.dialogElement = null;

        this.dragState = null;

        /** 焦点反馈动画相关 */
        this.focusFeedbackTimer = null;
        this.focusFeedbackAnimation = null;
    },
    beforeDestroy() {
        this.unregisterDialogInstance();
        this.unbindGlobalFocusHint();
        this.unbindKeyboardEvents();
        this.clearFocusFeedbackTimer();
        this.clearFocusFeedbackAnimation();
        window.removeEventListener("resize", this.handleViewportResize);
        this.stopDrag();
    },
    methods: {
        // ─── 生命周期 ────────────────────────────────────────────

        async show() {
            this.dialogReady = false;
            this.dialogVisible = true;
            
            this.lastActiveElement = document.activeElement;

            // 将当前 dialog 注册到栈上面，因为会打开多个dialog，按下键盘时容易找不到当前作用的 dialog
            this.registerDialogInstance();

            
            // this.handleViewportResize();
            // window.addEventListener("resize", this.handleViewportResize);
            this.bindKeyboardEvents();
            this.dialogElement = this.$el.querySelector(".el-dialog");
            this.$nextTick(() => {
                this.initDialogPosition();
                this.applyDialogState();
            });
        },

        /**
         *  el-dialog opened 事件：内容渲染完成后初始化焦点和按钮
         */
        handleOpened() {
            this.$nextTick(async () => {
                this.dialogElement = this.$el.querySelector(".el-dialog");
                this.bindGlobalFocusHint();
                this.bindHeaderDrag();
                this.applyDialogShadowState();
                this.refreshDialogActions();
                this.dialogReady = true;
                this.focusInitialElement();
            });
        },

        /**
         * 刷新底部按钮列表，询问内容组件最新的 actions，然后重新计算布局
         */
        refreshDialogActions() {
            return new Promise((resolve) => {
                this.$nextTick(() => {

                    // 获取组件中的 actions，
                    if (typeof this.$refs.dialogComponent?.dialogActions === "function") {
                        this.dialogActions = this.$refs.dialogComponent.dialogActions(this.createDialogHandle()) || [];
                    }
                    
                    resolve();
                    this.$nextTick(() => {
                        if (!this.isFullscreen && !this.dragState) {
                            this.initDialogPosition();
                            this.applyDialogState();
                        }
                    });
                });
            });
        },
        // 关闭对话框，记录返回值和原因，销毁组件
        hide(result, reason = "close") {
            this.dialogResult      = result;
            this.dialogCloseReason = reason;
            this.unregisterDialogInstance();
            this.unbindGlobalFocusHint();
            this.unbindKeyboardEvents();
            this.clearFocusFeedbackTimer();
            this.clearFocusFeedbackAnimation();
            // window.removeEventListener("resize", this.handleViewportResize);
            this.dialogVisible = false;
            this.resolveDialog(result, reason);
            this.restoreFocus();
            this.$destroy();
            this.$el.remove();
        },

        // ─── 对话框栈管理 ────────────────────────────────────────

        registerDialogInstance() {
            const idx = openedDialogStack.indexOf(this);
            if (idx > -1) openedDialogStack.splice(idx, 1);
            openedDialogStack.push(this);
            registerGlobalResize();
            updateModalOverlay();
            updateDialogStackState();
            // console.log(`注册了 ` + openedDialogStack.length);
        },
        unregisterDialogInstance() {
            const idx = openedDialogStack.indexOf(this);
            if (idx > -1) openedDialogStack.splice(idx, 1);
            this.dialogTopmost = false;
            this.applyDialogShadowState();
            unregisterGlobalResize();
            updateModalOverlay();
            updateDialogStackState();
        },
        // 当前是否是最顶层对话框（键盘事件只响应最顶层）
        isTopmostDialog() {
            return openedDialogStack.at(-1) === this;
        },
        applyDialogShadowState() {
            const wrapper = this.$el;
            const dialog  = this.dialogElement ?? this.$el?.querySelector(".el-dialog");

            if (wrapper?.classList) {
                wrapper.classList.toggle("app-dialog--topmost", this.dialogTopmost);
            }

            if (!dialog) return;

            // 边框由 border 保留；这里只清理非栈顶对话框的外阴影。
            dialog.style.boxShadow = this.dialogTopmost ? "" : "none";
        },

        // ─── 焦点反馈动画 ────────────────────────────────────────

        clearFocusFeedbackTimer() {
            if (this.focusFeedbackTimer) {
                clearTimeout(this.focusFeedbackTimer);
                this.focusFeedbackTimer = null;
            }
        },
        clearFocusFeedbackAnimation() {
            if (this.focusFeedbackAnimation) {
                this.focusFeedbackAnimation.cancel();
                this.focusFeedbackAnimation = null;
            }
        },

        /**
         * 点击对话框外部时触发抖动+阴影反馈，提示用户焦点在对话框内。
         */
        triggerFocusFeedback() {
            const dialog = this.dialogElement ?? this.$el.querySelector(".el-dialog");
            if (!dialog) return;

            this.clearFocusFeedbackTimer();
            this.clearFocusFeedbackAnimation();

            const x = this.dialogPosition?.left ?? 0;
            const y = this.dialogPosition?.top ?? 0;
            const t = `translate3d(${x}px,${y}px,0)`;
            const baseShadow  = "0 18px 48px rgba(15,23,42,.18),0 4px 14px rgba(15,23,42,.12),0 0 0 1px rgba(15,23,42,.06)";
            const flashShadow = "0 20px 52px rgba(15,23,42,.24),0 6px 18px rgba(15,23,42,.18),0 0 0 1px rgba(37,99,235,.22)";

            this.focusFeedbackAnimation = dialog.animate(
                [
                    { transform: `${t} scale(1)`,     boxShadow: baseShadow,  offset: 0    },
                    { transform: `${t} scale(0.997)`, boxShadow: flashShadow, offset: 0.33 },
                    { transform: `${t} scale(1.002)`, boxShadow: flashShadow, offset: 0.66 },
                    { transform: `${t} scale(1)`,     boxShadow: baseShadow,  offset: 1    },
                ],
                { duration: 220, iterations: 2, easing: "ease-in-out" }
            );

            this.focusFeedbackTimer = setTimeout(() => {
                this.clearFocusFeedbackAnimation();
                dialog.style.boxShadow = "";
                dialog.style.transform = t;
                this.focusFeedbackTimer = null;
            }, 440);
        },

        // ─── 键盘事件 ────────────────────────────────────────────

        bindKeyboardEvents() {
            document.addEventListener("keydown", this.handleKeydown, true);
        },
        unbindKeyboardEvents() {
            document.removeEventListener("keydown", this.handleKeydown, true);
        },
        handleKeydown(event) {
            if (!event || !this.dialogVisible || !this.isTopmostDialog()) {
                return;
            }

            if (event.key === "Tab") {
                this.handleTabNavigation(event);
                return;
            }

            if (event.key === "Escape" && this.dialogCloseOnEsc && !this.dialogDisableClose) {
                event.preventDefault();
                event.stopPropagation();
                this.handleCancel("esc");
                return;
            }

            if (event.key !== "Enter" || !this.submitOnEnter || !this.primaryAction) {
                return;
            }

            const target = event.target;
            if (target) {
                const tag = target.tagName?.toLowerCase();
                if (tag === "textarea" || tag === "button" || target.isContentEditable) {
                    return;
                }
                if (target.closest(".el-select,.el-select-dropdown,.el-autocomplete,.el-autocomplete-suggestion,.el-cascader,.el-cascader-menus,.el-picker-panel,.el-date-editor,.el-time-panel")) {
                    return;
                }
            }

            event.preventDefault();
            event.stopPropagation();

            if (this.primaryAction) {
                this.handleAction(this.primaryAction);
            }
        },

        // ─── Tab 焦点循环 ─────────────────────────────────────────

        handleTabNavigation(event) {
            const els = this.getFocusableElements();
            if (els.length === 0) {
                event.preventDefault();
                this.dialogElement?.focus();
                return;
            }
            const cur   = els.indexOf(document.activeElement);
            const shift = event.shiftKey;
            let next;
            if (cur === -1)     next = shift ? els.length - 1 : 0;
            else if (shift)     next = cur === 0 ? els.length - 1 : cur - 1;
            else                next = cur === els.length - 1 ? 0 : cur + 1;
            event.preventDefault();
            event.stopPropagation();
            els[next].focus();
        },

        getFocusableElements() {
            if (!this.dialogElement) return [];
            const selector = [
                "a[href]",
                "button:not([disabled])",
                'input:not([disabled]):not([type="hidden"])',
                "select:not([disabled])",
                "textarea:not([disabled])",
                '[tabindex]:not([tabindex="-1"])',
                '[contenteditable="true"]',
            ].join(",");
            return Array.from(this.dialogElement.querySelectorAll(selector)).filter((el) => {
                const style = window.getComputedStyle(el);
                return style.display !== "none" && style.visibility !== "hidden";
            });
        },

        // ─── 全局点击焦点提示 ─────────────────────────────────────

        bindGlobalFocusHint() {
            document.addEventListener("mousedown", this.handleGlobalMouseDown, true);
        },
        unbindGlobalFocusHint() {
            document.removeEventListener("mousedown", this.handleGlobalMouseDown, true);
        },
        handleGlobalMouseDown(event) {
            if (!event || !this.dialogVisible || !this.dialogElement || !this.isTopmostDialog()) return;
            const target = event.target;
            if (!target || this.dialogElement.contains(target)) return;
            if (target.closest(".el-select-dropdown,.el-picker-panel,.el-date-picker,.el-time-panel,.el-popover,.el-autocomplete-suggestion,.el-cascader-menus,.el-dropdown-menu,.el-tooltip__popper")) {
                return;
            }
            this.triggerFocusFeedback();
        },

        // ─── 视口尺寸 ────────────────────────────────────────────

        handleViewportResize() {
            this.viewportWidth  = window.innerWidth;
            this.viewportHeight = window.innerHeight;
            if (this.dialogVisible) {
                this.$nextTick(() => {
                    this.initDialogPosition();
                    this.applyDialogState();
                });
            }
        },

        // ─── 对话框位置 ───────────────────────────────────────────

        /**
         * 根据当前视口和对话框尺寸，计算居中初始位置
         */
        initDialogPosition() {
            if (!this.dialogElement) return;
            const { width, height } = this.dialogElement.getBoundingClientRect();
            this.dialogPosition = {
                left: Math.max(0, Math.round((window.innerWidth - width) / 2)),
                top:  Math.max(32, Math.round(32 + (window.innerHeight - 32 - height) / 2)),
            };
        },

        /**
         * 将当前状态（全屏/窗口、位置）应用到 DOM
         */
        applyDialogState() {
            const dialog = this.dialogElement ?? this.$el.querySelector(".el-dialog");
            if (!dialog) return;

            if (this.isFullscreen) {
                Object.assign(this.$el.style, { top: "32px", height: "calc(100% - 32px)", overflow: "hidden" });
                Object.assign(dialog.style, { position: "", left: "", top: "", width: "", height: "100%", marginTop: "", transform: "" });
                this.applyDialogShadowState();
                return;
            }

            Object.assign(this.$el.style, { top: "", height: "", overflow: "" });
            Object.assign(dialog.style, { position: "fixed", left: "0", top: "0", marginTop: "0", width: this.dialogWidth, height: this.dialogHeight });

            if (this.dialogPosition) {
                const { left, top } = this.dialogPosition;
                dialog.style.setProperty("--app-dialog-x", `${left}px`);
                dialog.style.setProperty("--app-dialog-y", `${top}px`);
                dialog.style.transform = `translate3d(${left}px,${top}px,0)`;
            }
            this.applyDialogShadowState();
        },

        // ─── 拖拽 ─────────────────────────────────────────────────

        // 绑定标题栏拖拽，全屏或禁用全屏时不可拖拽
        bindHeaderDrag() {
            const header = this.$el.querySelector(".el-dialog__header");
            if (!header) return;
            header.onpointerdown = this.startDrag;
            header.style.cursor = (this.isFullscreen || this.dialogDisableFullscreen) ? "default" : "move";
        },
        startDrag(event) {
            if (this.isFullscreen || this.dialogDisableFullscreen) return;
            const dialog = this.dialogElement;
            if (!dialog || event.target.closest(".app-dialog-tool-btn,.el-dialog__headerbtn")) return;

            const { left, top, width, height } = dialog.getBoundingClientRect();
            this.dragState = { disX: event.clientX - left, disY: event.clientY - top, width, height };

            dialog.style.willChange = "transform";
            document.body.style.userSelect = "none";

            // setPointerCapture 让后续所有 pointer 事件都发给这个元素
            // 即使鼠标移出窗口边界也不会丢失事件，解决拖到边缘卡住的问题
            event.currentTarget.setPointerCapture(event.pointerId);
            event.currentTarget.addEventListener("pointermove", this.handleDrag);
            event.currentTarget.addEventListener("pointerup", this.stopDrag);
            event.currentTarget.addEventListener("pointercancel", this.stopDrag);

            event.preventDefault();
        },
        handleDrag(event) {
            if (!this.dragState || !this.dialogElement || this.isFullscreen) return;
            const { disX, disY, width, height } = this.dragState;
            const left = Math.min(Math.max(0, event.clientX - disX), Math.max(0, window.innerWidth - width));
            const top  = Math.min(Math.max(32, event.clientY - disY), Math.max(32, window.innerHeight - height));
            this.dialogPosition = { left, top };
            this.dialogElement.style.setProperty("--app-dialog-x", `${left}px`);
            this.dialogElement.style.setProperty("--app-dialog-y", `${top}px`);
            this.dialogElement.style.transform = `translate3d(${left}px,${top}px,0)`;
        },
        stopDrag(event) {
            if (this.dialogElement) this.dialogElement.style.willChange = "";
            document.body.style.userSelect = "";

            if (event?.currentTarget) {
                event.currentTarget.releasePointerCapture(event.pointerId);
                event.currentTarget.removeEventListener("pointermove", this.handleDrag);
                event.currentTarget.removeEventListener("pointerup", this.stopDrag);
                event.currentTarget.removeEventListener("pointercancel", this.stopDrag);
            }

            this.dragState = null;
        },

        // ─── 焦点管理 ────────────────────────────────────────────

        /**
         * 对话框打开后聚焦初始元素。
         * 优先调用内容组件的 dialogInitialFocus()，否则自动找第一个可聚焦元素。
         */
        focusInitialElement() {
            if (!this.dialogElement) {
                return;
            }
            const component = this.$refs.dialogComponent;
            if (typeof component?.dialogInitialFocus === "function") {
                const target = component.dialogInitialFocus(this.createDialogHandle());
                if (typeof target?.focus === "function") {
                    target.focus();
                    return;
                }
            }
            const selector = '.el-dialog__body [autofocus],.el-dialog__footer .el-button--primary,.el-dialog__body input,.el-dialog__body select,.el-dialog__body textarea,.el-dialog__body button,.el-dialog__body [tabindex]:not([tabindex="-1"])';
            this.dialogElement.querySelector(selector)?.focus();
        },

        /**
         * 关闭后恢复打开前的焦点
         */
        restoreFocus() {
            const target = this.lastActiveElement;
            this.lastActiveElement = null;
            if (!target || typeof target.focus !== "function" || !document.contains(target)) return;
            this.$nextTick(() => target.focus());
        },


        // ─── 对话框句柄 ───────────────────────────────────────────

        /**
         * 创建并缓存对话框句柄。
         * 同时创建 result  awaPromise，对话框关闭时兑现，外部可it 获取结果。
         */
        createDialogHandle() {
            if (this.dialogHandle) return this.dialogHandle;
            const result = new Promise((resolve) => { this.dialogResolve = resolve; });
            this.dialogHandle = {
                getDefaultCancelButton: () => {
                    return { 
                        text: this.$t("base.cancel"), 
                        order: 200,
                        click (done){
                            done(null, "cancel");
                        },
                    };
                }, 
                instance:   this,
                result,
                update: (patch = {}) => {
                    if (!patch || typeof patch !== "object") {
                        return;
                    }

                    Object.keys(patch).forEach((key) => {
                        if (key === "closeOnEsc") {
                            this.dialogCloseOnEsc = patch[key];
                            return;
                        }

                        if (key === "disableClose") {
                            this.dialogDisableClose = patch[key];
                            return;
                        }

                        if (key === "disableFullscreen") {
                            this.dialogDisableFullscreen = patch[key];
                            this.bindHeaderDrag();
                            return;
                        }

                        if (key in this) {
                            this[key] = patch[key];
                        }
                    });
                },
                close:      (payload, reason = "close")   => this.hide(payload, reason),
            };
            return this.dialogHandle;
        },

        // 兑现 result Promise
        resolveDialog(result, reason) {
            const resolve = this.dialogResolve;
            if (typeof resolve !== "function") {
                return; 
            }
            this.dialogResolve = null;
            resolve({ 
                result, 
                reason,
                canceled: reason === "cancel" || reason === "close",
            });
        },

        

        // ─── 操作处理 ────────────────────────────────────────────
        /**
         * 取消操作：依次调用 onCancel prop 和内容组件的 dialogCancel()。
         * 任一返回 false 则阻止关闭。
         */
        async handleCancel(reason = "cancel", payload) {
            if (this.dialogDisableClose) {
                this.triggerFocusFeedback();
                return;
            }
            this.hide(payload, reason);
        },

        /**
         * 自定义按钮操作：调用 action.handler，根据返回值决定是否关闭。
         */
        async handleAction(action) {
            if (typeof action.click === "function") {

                const done = (payload, reason) => {
                    this.hide(payload, reason ?? "action");
                };

                action.click(done, this.createDialogHandle(), this.$refs.dialogComponent);
                return;
            }
        },

        // ─── 全屏切换 ────────────────────────────────────────────

        toggleFullscreen() {
            if (this.dialogDisableFullscreen) {
                return;
            }
            this.isFullscreen = !this.isFullscreen;
            this.stopDrag();
            this.$nextTick(() => {
                this.applyDialogState();
                this.bindHeaderDrag();
            });
        },

        // ─── 动态组件 props ───────────────────────────────────────

        componentProps() {
            const dialog = this.createDialogHandle();
            if (this.component) {
                return { 
                    is: this.component, 
                    dialog, 
                    ...this.params 
                };
            }
            return {
                is: "iframe",
                src: this.src,
                target: "_blank",
                rel: "noopener",
                width: "100%",
                height: "100%",
                style: "vertical-align:top",
                webpreferences: "nodeIntegration=true, contextIsolation=false",
            };
        },

        getDialogElement() {
            return this.$refs.dialogElement?.$el?.querySelector(".el-dialog");
        }
    },
};
</script>

<style>
/* 对话框未就绪时隐藏，避免位置闪烁 */
.el-dialog__wrapper.app-dialog--pending {
    overflow: hidden;
}
.el-dialog__wrapper.app-dialog--pending .el-dialog,
.el-dialog__wrapper.app-dialog--pending .dialog-fade-enter-active,
.el-dialog__wrapper.app-dialog--pending .dialog-fade-leave-active {
    visibility: hidden;
    transition: none !important;
    animation: none !important;
}

/* 对话框主体 */
.app-dialog {
    transition: none !important;
    animation: none !important;
    display: flex;
    flex-direction: column;
    max-height: none !important;
    overflow: hidden;
    border-radius: 3px;
    border: 1px solid rgba(15, 23, 42, 0.08);
    box-sizing: border-box;
    box-shadow: none !important;
}
.el-dialog__wrapper.app-dialog--topmost .app-dialog {
    box-shadow:
        0 18px 48px rgba(15, 23, 42, 0.18),
        0 4px 14px rgba(15, 23, 42, 0.12) !important;
}
.app-dialog.is-fullscreen {
    overflow: hidden;
}
.app-dialog .el-dialog__body {
    flex: 1;
    min-height: 0;
    overflow: auto;
    display: flex;
    flex-direction: column;
}
.app-dialog .el-dialog__body > * {
    flex: 1;
    min-height: 0;
}
.app-dialog .el-dialog__footer {
    flex-shrink: 0;
}

/* 标题栏 */
.app-dialog .el-dialog__header {
    user-select: none;
    position: relative;
    display: flex;
    align-items: center;
    padding: 10px 52px 10px 16px;
    box-sizing: border-box;
    flex-shrink: 0;
}
.el-dialog__title {
    font-size: 16px;
}
.app-dialog .el-dialog__headerbtn {
    top: 50%;
    right: 14px;
    width: 22px;
    height: 22px;
    margin-top: -11px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
}
.app-dialog .el-dialog__headerbtn:hover {
    background: var(--app-theme-hover-background);
}
.app-dialog .el-dialog__close {
    width: 14px;
    height: 14px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
}

/* 自定义标题栏布局 */
.app-dialog-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
}
.app-dialog-title__main {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 4px;
}
.app-dialog-title__actions {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    margin-right: 5px;
}

/* 工具按钮 */
.app-dialog-tool-btn {
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--app-theme-text-secondary);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: background-color 0.12s ease, color 0.12s ease;
    flex-shrink: 0;
}
.app-dialog-tool-btn:hover {
    background-color: var(--app-theme-hover-background);
    color: var(--app-theme-text-primary);
}
.app-dialog-tool-btn.is-disabled,
.app-dialog-tool-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}
.app-dialog-tool-btn.is-disabled:hover,
.app-dialog-tool-btn:disabled:hover {
    background: transparent;
    color: var(--app-theme-text-secondary);
}

.app-dialog-tool-btn i {
    font-size: 16px;
    line-height: 1;
}
/* 最后一个按钮（关闭）hover 用危险色 */
.app-dialog-title__actions .app-dialog-tool-btn:last-child:not(.is-disabled):hover {
    background-color: var(--app-theme-window-close-hover-bg);
    color: var(--app-theme-window-close-hover-text);
}

.v-modal ~ .v-modal {
    display: none;
}
</style>
