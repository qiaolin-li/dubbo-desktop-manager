import type { RendererPlugin } from './renderer';

/**
 * appView 是宿主在渲染进程插件沙箱里注入的模块。
 */
declare const appView: RendererPlugin;

export default appView;

/**
 * 插件 npm 包名。
 */
export declare const pluginName: RendererPlugin['pluginName'];

/**
 * 使用宿主全局语言包翻译。
 */
export declare const t: RendererPlugin['t'];

/**
 * 使用当前插件语言包翻译。
 */
export declare const pluginT: RendererPlugin['pluginT'];

/**
 * 监听当前插件命名空间下的事件。
 */
export declare const on: RendererPlugin['on'];

/**
 * 取消监听当前插件命名空间下的事件。
 */
export declare const off: RendererPlugin['off'];

/**
 * 触发当前插件命名空间下的事件。
 */
export declare const emit: RendererPlugin['emit'];

/**
 * 监听一次当前插件命名空间下的事件。
 */
export declare const once: RendererPlugin['once'];

/**
 * 设置当前插件命名空间下的配置项。
 */
export declare const setPluginProperty: RendererPlugin['setPluginProperty'];

/**
 * 判断当前插件命名空间下的配置项是否存在。
 */
export declare const hasPluginProperty: RendererPlugin['hasPluginProperty'];

/**
 * 获取当前插件命名空间下的配置项。
 */
export declare const getPluginProperty: RendererPlugin['getPluginProperty'];

/**
 * 获取当前插件命名空间下的全部配置。
 */
export declare const getPluginProperties: RendererPlugin['getPluginProperties'];

/**
 * 注册一个插件菜单，供其他页面或插件填充使用。
 */
export declare const addPluginMenu: RendererPlugin['addPluginMenu'];

/**
 * 按模块填充已注册的插件菜单。
 */
export declare const fillPluginMenu: RendererPlugin['fillPluginMenu'];

/**
 * 弹出右键菜单。
 */
export declare const popupContextMenu: RendererPlugin['popupContextMenu'];

/**
 * 添加标题栏工具菜单。
 */
export declare const addToolbarMenu: RendererPlugin['addToolbarMenu'];

/**
 * 添加状态栏项目。
 */
export declare const addStatusbarItem: RendererPlugin['addStatusbarItem'];

/**
 * 注册项目信息编辑组件。
 */
export declare const addProjectUpdateComponent: RendererPlugin['addProjectUpdateComponent'];

/**
 * 注册项目主页组件。
 */
export declare const addProjectPageComponent: RendererPlugin['addProjectPageComponent'];

/**
 * 注册插件设置页。
 */
export declare const addPluginSettingPage: RendererPlugin['addPluginSettingPage'];

/**
 * 包装 Vue 组件并注入插件上下文能力。
 */
export declare const wrapComponent: RendererPlugin['wrapComponent'];

/**
 * 引用当前插件主进程暴露的服务。
 */
export declare const referenceService: RendererPlugin['referenceService'];

/**
 * 获取插件国际化注册器。
 */
export declare const geti18nRegistrar: RendererPlugin['geti18nRegistrar'];

/**
 * 写入系统剪贴板。
 */
export declare const writeClipboard: RendererPlugin['writeClipboard'];

/**
 * 打开自定义弹窗。
 */
export declare const openDialog: RendererPlugin['openDialog'];

/**
 * 打开带默认操作按钮的简单弹窗。
 */
export declare const openSimpleDialog: RendererPlugin['openSimpleDialog'];

/**
 * 发送系统通知。
 */
export declare const notify: RendererPlugin['notify'];
