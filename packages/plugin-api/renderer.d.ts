import type Vue, { ComponentOptions } from 'vue';
import type { NotifyInfo } from './main';

/**
 * Vue 组件对象或已注册的组件名。
 */
export type VueComponent = typeof Vue | ComponentOptions<Vue> | Record<string, any>;

/**
 * 插件事件回调函数。
 */
export type PluginEventHandler = (...args: any[]) => void;

/**
 * 渲染端访问主进程服务时得到的代理对象。
 */
export type ServiceProxy<T extends object = Record<string, any>> = T;

/**
 * 渲染端菜单项配置，兼容工具栏、右键菜单和插件菜单。
 */
export interface MenuItem {
    /**
     * 菜单唯一标识。
     */
    id?: string;

    /**
     * 菜单显示文案。
     */
    label?: string;

    /**
     * 菜单图标名称。
     */
    icon?: string;

    /**
     * 点击菜单后打开的 URL。
     */
    src?: string;

    /**
     * 点击菜单后打开的 Vue 组件。
     */
    component?: VueComponent;

    /**
     * 点击菜单时执行的回调。
     */
    click?: (...args: any[]) => void;

    /**
     * 子菜单列表。
     */
    subMenus?: MenuItem[];

    /**
     * 是否允许同一个菜单打开多个实例。
     */
    multiInstance?: boolean;

    /**
     * 传给目标页面或组件的参数。
     */
    params?: Record<string, any>;

    /**
     * 允许宿主或插件扩展额外菜单字段。
     */
    [key: string]: any;
}

/**
 * 注册到指定模块的插件菜单配置。
 */
export interface PluginMenuOptions {
    /**
     * 菜单所属模块名。
     */
    module: string;

    /**
     * 菜单分组名。
     */
    group?: string;

    /**
     * 需要参照插入的菜单 ID。
     */
    relativeMenu?: string;

    /**
     * 插入位置。
     */
    anchor?: 'first' | 'last' | 'before' | 'after' | string;

    /**
     * 菜单显示条件，返回 false 时不展示。
     */
    test?: (...args: any[]) => boolean;

    /**
     * 实际菜单项配置。
     */
    menuInfo: MenuItem;
}

/**
 * 标题栏工具菜单配置。
 */
export interface ToolbarMenu extends MenuItem {
    /**
     * 标题栏菜单显示文案。
     */
    label: string;

    /**
     * 标题栏菜单图标名称。
     */
    icon: string;
}

/**
 * 项目主页扩展页面配置。
 */
export interface ProjectPageOptions {
    /**
     * 项目类型。
     */
    type: string;

    /**
     * 项目主页组件。
     */
    component: VueComponent;
}

/**
 * 项目信息编辑组件配置。
 */
export interface ProjectUpdateOptions {
    /**
     * 项目类型。
     */
    type: string;

    /**
     * 项目信息编辑组件。
     */
    component: VueComponent;

    /**
     * 编辑组件显示名称。
     */
    label: string;
}

/**
 * 插件设置页配置。
 */
export interface PluginSettingPageOptions {
    /**
     * 设置页显示标题。
     */
    label: string;

    /**
     * 设置页 Vue 组件。
     */
    component: VueComponent;

    /**
     * 设置页描述，会显示在设置页面内容上方。
     */
    description?: string;
}

/**
 * 状态栏项目配置。
 */
export interface StatusbarItemOptions {
    /**
     * 状态栏位置。
     */
    alignment?: 'left' | 'right' | string;

    /**
     * 排序优先级，值越大越靠前。
     */
    priority?: number;
}

/**
 * 状态栏项目句柄，真实属性由宿主状态栏实现提供。
 */
export interface StatusbarItem {
    /**
     * 状态栏项目唯一 ID。
     */
    readonly id: string;

    /**
     * 状态栏位置。
     */
    readonly alignment: 'left' | 'right';

    /**
     * 所属插件模块名。
     */
    readonly module: string;

    /**
     * 排序值。
     */
    order: number;

    /**
     * 显示的图标。
     */
    icon: string;

    /**
     * 显示的文本。
     */
    text: string;

    /**
     * 鼠标悬停时显示的弹出组件。
     */
    popoverComponent: VueComponent | null;

    /**
     * 传给弹出组件的参数。
     */
    popoverParams: Record<string, any>;

    /**
     * 弹出框高度。
     */
    popoverHeight: number | string | null;

    /**
     * 鼠标悬停提示文本。
     */
    tooltip: string;

    /**
     * 是否显示警告样式。
     */
    warning: boolean;

    /**
     * 是否禁用点击。
     */
    disabled: boolean;

    /**
     * 是否可见。
     */
    visible: boolean;

    /**
     * 点击状态栏项目时执行的回调。
     */
    click: null | (() => void);

    /**
     * 显示状态栏项目。
     */
    show(): void;

    /**
     * 隐藏状态栏项目。
     */
    hide(): void;

    /**
     * 从状态栏移除项目。
     */
    dispose(): void;
}

/**
 * 插件弹窗配置。
 */
export interface DialogOptions {
    /**
     * 弹窗标题。
     */
    title?: string;

    /**
     * 弹窗内容组件。未传 component 时，宿主会按 src 打开 iframe。
     */
    component?: VueComponent;

    /**
     * iframe 模式下打开的地址。
     */
    src?: string;

    /**
     * 弹窗宽度。
     */
    width?: number;

    /**
     * 弹窗高度。
     */
    height?: number;

    /**
     * 传给弹窗组件的参数。
     */
    params?: Record<string, any>;

    /**
     * 自定义底部按钮列表。
     */
    actions?: DialogAction[];

    /**
     * 初始是否全屏。
     */
    fullscreen?: boolean;

    /**
     * 是否禁用全屏按钮。
     */
    disableFullscreen?: boolean;

    /**
     * 是否允许 ESC 关闭。
     */
    closeOnEsc?: boolean;

    /**
     * 是否禁用关闭按钮。
     */
    disableClose?: boolean;

    /**
     * 是否在 Enter 键时触发主操作按钮。
     */
    submitOnEnter?: boolean;

    /**
     * 允许弹窗扩展额外配置。
     */
    [key: string]: any;
}

/**
 * 弹窗底部操作按钮配置。
 */
export interface DialogAction {
    /**
     * 按钮文案。
     */
    text: string;

    /**
     * 按钮类型。
     */
    type?: string;

    /**
     * 排序值。
     */
    order?: number;

    /**
     * 点击按钮时执行的回调。
     */
    click?: (done: (payload?: any, reason?: string) => void, dialog: DialogHandle, component: any) => void;

    /**
     * 允许按钮配置扩展额外字段。
     */
    [key: string]: any;
}

/**
 * 带默认确认/取消按钮的简单弹窗配置。
 */
export interface SimpleDialogOptions extends DialogOptions {
    /**
     * 是否显示确认按钮。
     */
    showConfirmButton?: boolean;

    /**
     * 确认按钮文案。
     */
    confirmText?: string;

    /**
     * 点击确认按钮时执行的回调。
     */
    onConfirm?: (done: (data?: any) => void, dialog: DialogHandle, component: any) => void;

    /**
     * 是否显示取消按钮。
     */
    showCancelButton?: boolean;

    /**
     * 取消按钮文案。
     */
    cancelText?: string;

    /**
     * 点击取消按钮时执行的回调。
     */
    onCancel?: (done: (data?: any) => void, dialog: DialogHandle, component: any) => void;
}

/**
 * 弹窗关闭后返回的结果。
 */
export interface DialogResult<T = any> {
    /**
     * 弹窗关闭时携带的数据。
     */
    result?: T;

    /**
     * 弹窗关闭原因。
     */
    reason?: string;

    /**
     * 是否为取消或直接关闭。
     */
    canceled: boolean;

    /**
     * 允许弹窗结果扩展额外字段。
     */
    [key: string]: any;
}

/**
 * 弹窗控制句柄。
 */
export interface DialogHandle<T = any> {
    /**
     * 获取默认取消按钮配置。
     */
    getDefaultCancelButton(): DialogAction;

    /**
     * 弹窗内部组件实例。
     */
    instance: any;

    /**
     * 弹窗关闭后的异步结果。
     */
    result: Promise<DialogResult<T>>;

    /**
     * 关闭弹窗并返回数据。
     */
    close(payload?: any, reason?: string): void;

    /**
     * 局部更新弹窗配置或状态。
     */
    update(patch: Record<string, any>): void;
}


/**
 * 渲染进程插件入口拿到的宿主对象。
 */
export interface RendererPlugin {
    /**
     * 插件 npm 包名。
     */
    readonly pluginName: string;

    /**
     * 使用宿主全局语言包翻译。
     */
    t(key: string, ...args: any[]): string;

    /**
     * 使用当前插件语言包翻译。
     */
    pluginT(key: string, ...args: any[]): string;

    /**
     * 监听当前插件命名空间下的事件。
     */
    on(event: string, handler: PluginEventHandler): void;

    /**
     * 取消监听当前插件命名空间下的事件。
     */
    off(event: string, handler?: PluginEventHandler): void;

    /**
     * 触发当前插件命名空间下的事件。
     */
    emit(event: string, ...args: any[]): void;

    /**
     * 监听一次当前插件命名空间下的事件。
     */
    once(event: string, handler: PluginEventHandler): void;

    /**
     * 设置当前插件命名空间下的配置项。
     */
    setPluginProperty(key: string, value: any): any;

    /**
     * 判断当前插件命名空间下的配置项是否存在。
     */
    hasPluginProperty(key: string): boolean;

    /**
     * 获取当前插件命名空间下的配置项。
     */
    getPluginProperty<T = any>(key: string): T;

    /**
     * 获取当前插件命名空间下的全部配置。
     */
    getPluginProperties<T = Record<string, any>>(): T;

    /**
     * 注册一个插件菜单，供其他页面或插件填充使用。
     */
    addPluginMenu(options: PluginMenuOptions): void;

    /**
     * 按模块填充已注册的插件菜单。
     */
    fillPluginMenu(module: string, menuTemplate: MenuItem[], ...args: any[]): void;

    /**
     * 弹出右键菜单。
     */
    popupContextMenu(menuInfo: { template: MenuItem[] }): void;

    /**
     * 添加标题栏工具菜单。
     */
    addToolbarMenu(menu: ToolbarMenu): void;

    /**
     * 添加状态栏项目。
     */
    addStatusbarItem(statusbar: StatusbarItemOptions): StatusbarItem;

    /**
     * 注册项目信息编辑组件。
     */
    addProjectUpdateComponent(projectUpdate: ProjectUpdateOptions): void;

    /**
     * 注册项目主页组件。
     */
    addProjectPageComponent(projectPage: ProjectPageOptions): void;

    /**
     * 注册插件设置页。
     */
    addPluginSettingPage(pluginSetttingPage: PluginSettingPageOptions): void;

    /**
     * 包装 Vue 组件并注入插件上下文能力。
     */
    wrapComponent<T = VueComponent>(component: T): T;

    /**
     * 引用当前插件主进程暴露的服务。
     */
    referenceService<T extends object = Record<string, any>>(moduleName: string): ServiceProxy<T>;

    /**
     * 获取插件国际化注册器。
     */
    geti18nRegistrar(): import('./main').I18nRegistrar;

    /**
     * 写入系统剪贴板。
     */
    writeClipboard(text: string): void;

    /**
     * 打开自定义弹窗。
     */
    openDialog<T = any>(dialogInfo: DialogOptions): DialogHandle<T>;

    /**
     * 打开带默认操作按钮的简单弹窗。
     */
    openSimpleDialog<T = any>(dialogInfo: SimpleDialogOptions): DialogHandle<T>;

    /**
     * 发送系统通知。
     */
    notify(notifyInfo: NotifyInfo): void;
}

/**
 * 渲染进程入口函数类型，对应 package.json 的 rendererMain 字段。
 */
export type RendererEntry = (appView: RendererPlugin) => import('./main').PluginInstallable;
