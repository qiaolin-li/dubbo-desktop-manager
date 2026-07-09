import Vue                      from 'vue'

import consumer 				from '@/renderer/api/ApiConsumer.js'

import ddmIcon 					from '@/renderer/components/ddm-icon.vue';

import AppPages              	from '@/renderer/components/pages/pages.vue';

import AppCopyButton            from "@/renderer/components/button/copy-button.vue";
import AppIcon            		from '@/renderer/components/button/icon.vue';
import AppIconButton            from '@/renderer/components/button/icon-button.vue';
import AppIconGroup             from '@/renderer/components/button/icon-group.vue';

import AppCollapse 				from "@/renderer/components/collapse/collapse.vue";
import AppCollapseItem 			from "@/renderer/components/collapse/collapse-item.vue";

import AppPanels                from '@/renderer/components/panel/panel.vue';
import AppPanel                 from '@/renderer/components/panel/panel-item.vue';
import AppContentPanel          from '@/renderer/components/panel/content-panel.vue';

import AppTree                  from '@/renderer/components/tree/tree.vue';

import AppDivider               from '@/renderer/components/divider.vue';

import AppJsonEditor        	from "@/renderer/components/editor/json-editor.vue";
import AppYamlCodeEditor        from "@/renderer/components/editor/yaml-editor.vue";

import pluginManagerClient      from '@/renderer/api/PluginManagerClient';
import appTelnetTerminal        from "@/renderer/components/terminal/telnet-terminal.vue";
import loading                  from "@/renderer/common/utils/MyLoading";
import AppRendererPlugin	    from '@/renderer/core/plugin/AppRendenerPlugin.js';
import { Message }              from 'element-ui';
import i18n                     from '@/renderer/common/i18n'

import dialogHelper             from '@/renderer/components/dialog/index.js'

import themesManager 			from '@/renderer/themes/index.js'
import statusbartManager 		from '@/renderer/core/statusbar/index.js'


class AppRendenerCore {

	#bus = new Vue();
	on = this.#bus.$on.bind(this.#bus);
	off = this.#bus.$off.bind(this.#bus);

	/** 提交一个事件 */
	emit = this.#bus.$emit.bind(this.#bus);
	once = this.#bus.$once.bind(this.#bus);

	constant = window.constant;
	
	#ddmBridge = window.ddmBridge();
	
	appConfig = this.#ddmBridge.appConfig;

	/** @type {import('@/main/preload/AppIpc.js').default} */
	appIpc = this.#ddmBridge.appIpc;
	appDialog = this.#ddmBridge.appDialog;
	appWindow = this.#ddmBridge.appWindow;
	appShell = this.#ddmBridge.appShell;
	appMenu = this.#ddmBridge.appMenu;
	appClipboard = this.#ddmBridge.appClipboard;

	appTelnet = this.#ddmBridge.appTelnet;


	writeClipboard = (text) => {
		navigator.clipboard.writeText(text);
		Message.success(i18n.t("editor.copySuccess"));
	};

	/**
	 * 打开一个 dialog 框，里面放置用户的组件
	 * @param {object} dialogInfo
	 */
	openDialog = dialogHelper.openDialog.bind(dialogHelper);

	constructor() {
		themesManager.init(this);
	}

	/**
	 * 初始化
	 * @param {*} Vue
	 */
	async init(Vue) {
		this.installCommonComponents(Vue);
		this.installCommonModules(Vue);
		
		statusbartManager.init();

		await this.loadPlugin(Vue);
	}

	installCommonComponents(Vue) {
				
		const globalComponents = [

			ddmIcon, AppIcon, AppIconButton, AppIconGroup, AppDivider, AppCopyButton, 
			
			// 面板类
			AppPages, AppContentPanel, AppPanels, AppPanel, AppTree, AppCollapse, AppCollapseItem,

			// 编辑器相关
			AppJsonEditor, AppYamlCodeEditor, 

			// 终端
			appTelnetTerminal
		]; 

		globalComponents.forEach(component => {
			Vue.component(component.name, component);
		});

	}

	installCommonModules(Vue) {
		Vue.prototype.$loading = loading;

		Vue.prototype.$openTab = (tab) => {
			window.dispatchEvent(new CustomEvent("ddm-open-tab", { detail: { tab } }));
		}
	}

	async loadPlugin() {
		const pluginInfos = await pluginManagerClient.getPluginModules();

		await Promise.all(
			pluginInfos.map(async (plugin) => {
				try {
					// 1、创建插件核心对象
					const appPluginCore = new AppRendererPlugin(plugin.pluginName);

					const pluginHelper = this.#ddmBridge.pluginHelper(plugin.pluginDir, plugin.pluginName);

					// 2、加载插件国际化文件
					if (plugin.i18nPath) {
						// const i18nModule = requireFunc(plugin.i18nPath)(appPluginCore.geti18nRegistrar());
						const i18nModule = this.#loadPluginI18nFile(appPluginCore, pluginHelper, plugin);

						await i18nModule.install();
					}

					// 3、加载插件渲染逻辑
					if (plugin.rendererPath) {
						
						const module = this.#loadPluginRendererFile(appPluginCore, pluginHelper, plugin);
						await module.install();
					}
				} catch (error) {
					console.error(error);
				}
			}),
		);
	}

	/**
	 *
	 * @param {*} appPluginCore
	 * @param {*} pluginHelper
	 * @param {*} plugin
	 * @returns
	 */
	#loadPluginI18nFile(appPluginCore, pluginHelper, plugin) {
		let pluginCode = plugin.i18nContent;

		// 核心：添加 sourceURL 指向原始文件路径
		let path = plugin.i18nPath.replace(/\\/g, "/");
		// 寻找 pluginName 之后的路径
		const index = path.indexOf(plugin.pluginName);
		if (index !== -1) {
			path = path.substring(index + plugin.pluginName.length);
		}
		pluginCode += `\n//# sourceURL=${plugin.pluginName}://${path}`;

		// 定义沙箱里的 require
		const customRequire = (name) => {
			const module = { exports: {} };
			const wrapper = new Function("require", "module", "exports", "__dirname", pluginHelper.requireModule(name));
			wrapper(customRequire, module, module.exports, plugin.pluginPath);
			return module.exports;
		};
		// 即使没有沙箱，也建议用闭包包一层，防止变量污染
		const module = { exports: {} };

		const wrapper = new Function("require", "module", "exports", "__dirname", pluginCode);

		// 这里的 require 是真正的 Node require
		wrapper(customRequire, module, module.exports, plugin.pluginPath);
		return module.exports(appPluginCore.geti18nRegistrar());
	}

	/**
	 *
	 * @param { AppRendererPlugin } appPluginCore
	 * @param {*} pluginCode
	 * @param {*} pluginPath
	 * @returns
	 */
	#loadPluginRendererFile(appPluginCore, pluginHelper, plugin) {
		let pluginCode = plugin.rendererContent;

		// 核心：添加 sourceURL 指向原始文件路径
		let path = plugin.rendererPath.replace(/\\/g, "/");
		// 寻找 pluginName 之后的路径
		const index = path.indexOf(plugin.pluginName);
		if (index !== -1) {
			path = path.substring(index + plugin.pluginName.length);
		}
		// 核心：添加 sourceURL 指向原始文件路径
		pluginCode += `\n//# sourceURL=${plugin.pluginName}://${path}`;

		// 定义沙箱里的 require
		const appRenderModule = this.#createAppRenderModule(appPluginCore);
		const customRequire = (name) => {
			// 支持 import appView from 'appView' 直接获取 appPluginCore 对象，简化插件开发
			if("appView" === name){
				return appRenderModule;
			}

			return pluginHelper.requireModule(name);
		};

		// 即使没有沙箱，也建议用闭包包一层，防止变量污染
		const module = { exports: {} };
		const wrapper = new Function("require", "module", "exports", "__dirname", pluginCode);

		// 这里的 require 是真正的 Node require
		wrapper(customRequire, module, module.exports, plugin.rendererPath);
		return module.exports(appPluginCore);
	}

	#createAppRenderModule(appPluginCore) {
		const appRenderModule = {
			__esModule: true,
			default: appPluginCore,
		};

		let current = appPluginCore;
		while (current && current !== Object.prototype) {
			Reflect.ownKeys(current).forEach(key => {
				if (key === "constructor" || key === "default" || key === "__esModule" || Object.prototype.hasOwnProperty.call(appRenderModule, key)) {
					return;
				}

				const descriptor = Object.getOwnPropertyDescriptor(current, key);
				if (!descriptor) {
					return;
				}

				if ("value" in descriptor) {
					appRenderModule[key] = typeof descriptor.value === "function" ? descriptor.value.bind(appPluginCore) : descriptor.value;
					return;
				}

				Object.defineProperty(appRenderModule, key, {
					enumerable: descriptor.enumerable,
					configurable: false,
					get: descriptor.get ? () => descriptor.get.call(appPluginCore) : undefined,
				});
			});

			current = Object.getPrototypeOf(current);
		}

		return Object.freeze(appRenderModule);
	}



	notify({ title, body }) {
		new Notification(title, { body: body });
	}
}

const appRenener = new AppRendenerCore(Vue);


export const appIpc = appRenener.appIpc;

export const appConfig = appRenener.appConfig;
export const appShell = appRenener.appShell;

export const appMenu = appRenener.appMenu;
export const appDialog = appRenener.appDialog;
export const appWindow = appRenener.appWindow;
export const appClipboard = appRenener.appClipboard;

export const appTelnet = appRenener.appTelnet;

export default appRenener;
