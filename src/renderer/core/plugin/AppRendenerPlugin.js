import Vue                      			from 'vue'
import i18n                     			from '@/renderer/common/i18n'

import appRenderer, { appConfig, appWindow }  from '@/renderer/core/AppRenderer.js';
import { useLayoutStore }       			from '@/renderer/store/modules/layout.js';
import appPages              				from '@/renderer/components/pages/pages.vue';

import dialogHelper             			from '@/renderer/components/dialog/index.js'

import projectManager 						from '@/renderer/core/project/index.js'
import statusbarManager 					from '@/renderer/core/statusbar/index.js'

import actionManager 						from '@/renderer/core/action/index.js';

import settingsManager          			from '@/renderer/core/settings/index.js';

import consumer                 			from '@/renderer/api/ApiConsumer';



/**
 * 插件核心类，一个插件对应了一个对象，提供了插件渲染器的基本功能
 * 包括组件注册、菜单注册、数据源组件注册等
 * 插件渲染器核心类是插件渲染器的入口，插件可以通过它来访问应用的核心功能
 *
 */

class AppRendererPlugin {

	/** @type {string} 插件名称 */
	#pluginName = null;

	get pluginName() {
		return this.#pluginName;
	}

	/** 
	 * 插件 vue 组件 mixin 组件
	 * 用来给插件的组件添加一些属性和方法
	 **/ 
	#componentMixins;

	constructor(pluginName) {

		this.#pluginName = pluginName;
		this.#componentMixins = this.#createPluginMixinComponent();

		// 国际化
		this.t = i18n.t.bind(i18n);
		this.pluginT = (key, ...args) => i18n.t(`pluginLocale.${pluginName}.${key}`, ...args);
		
		// 消息总线
		const getEventKey       = (event) => `pluginEvent.${this.#pluginName}.${event}`;
		this.on   = (event, ...args) => appRenderer.on(getEventKey(event), ...args);
		this.off  = (event, ...args) => appRenderer.off(getEventKey(event), ...args);
		this.emit = (event, ...args) => appRenderer.emit(getEventKey(event), ...args);
		this.once = (event, ...args) => appRenderer.once(getEventKey(event), ...args);

		// 插件配置相关
		const getConfigKey       = (key) => `pluginConfig.${this.#pluginName}.${key}`;
		this.setPluginProperty   = (key, value) => appConfig.setProperty(getConfigKey(key), value);
		this.hasPluginProperty   = (key) => appConfig.hasProperty(getConfigKey(key));
		this.getPluginProperty   = (key) => appConfig.getProperty(getConfigKey(key));
		this.getPluginProperties = () => appConfig.getProperty(`pluginConfig.${this.#pluginName}`);
		
		// 插件和插件之间交流的办法，A 插件约定 module ， B插件注册pluginMenu，A插件通过fillPluginMenu 来获取菜单列表
		this.addPluginMenu = actionManager.addPluginMenu.bind(actionManager);
		this.fillPluginMenu = actionManager.fillPluginMenu.bind(actionManager);

		// 工具类
		this.writeClipboard = appRenderer.writeClipboard.bind(appRenderer);

		Object.freeze(this);
		Object.freeze(AppRendererPlugin.prototype);
	}



	// 暂时不考虑开放，防止全局污染
	// component(name, component) {
	// 	for (let name1 in Vue.options.components) {
	// 		if (name1.toLowerCase() === name.toLowerCase()) {
	// 			console.warn(`component name conflict: ${name} and ${name1}`);
	// 		}
	// 	}
	// 	Vue.component(name, this.wrapComponent(component));
	// }

	/**
	 * 包装一下vue组件，给他添加一些属性、方法，方便插件使用
	 * @param {VueComponent} component
	 * @returns
	 */
	wrapComponent(component) {
		return this.#wrapComponentRecursive(component, new WeakSet());
	}

	/**
	 * 解决组件中 componets 依赖自己组件的问题，需要把整个链路的组件都 mixin 一下
	 * @param {} component 
	 * @param {*} visited 
	 * @returns 
	 */
	#wrapComponentRecursive(component, visited) {
		// 不是对象那么肯定不是 vue组件，直接 return
		if (!component || typeof component !== "object") {
			return component;
		}

		// 已经注入过，直接 return
		if (visited.has(component)) {
			return component;
		}
		visited.add(component);

		if (!Array.isArray(component.mixins)) {
			component.mixins = [];
		}

		if (!component.mixins.includes(this.#componentMixins)) {
			component.mixins.push(this.#componentMixins);
		}

		// 循环 + 递归来解决依赖的组件注入问题
		if (component.components && typeof component.components === "object") {
			Object.keys(component.components).forEach(name => {
				component.components[name] = this.#wrapComponentRecursive(component.components[name], visited);
			});
		}

		// 注入 appPages 组件，让插件使用 appPages 组件时打开自定义组件时能够自动包装组件注入 minxins之内的
		this.#injectPluginTabs(component);
		return component;
	}

	#injectPluginTabs(component) {
		const self = this;
		const Tab = Vue.extend({
			name: "app-pages",
			extends: appPages,
			methods: {
				addTab(tabInfo) {
					tabInfo.component = self.wrapComponent(tabInfo.component);
					return this.$options.extends.methods.addTab.call(this, tabInfo);
				},
			},
		});

		if (!component.components || typeof component.components !== "object") {
			component.components = {};
		}

		component.components["appPages"] = Tab;
	}

	/**
	 * 弹出右键菜单
	 */
	popupContextMenu(menuInfo) {
		// TODO 未来用上模拟菜单吧
		// let lastContextMenuPosition = { x: 0, y: 0 };
		
		// document.addEventListener('contextmenu', (e) => {
		// 	lastContextMenuPosition = { x: e.clientX, y: e.clientY };
		// 	console.log(lastContextMenuPosition)
		// });

		appWindow.popupMenu(menuInfo);
	}

	/**
	 * 注册一个toolbar菜单，显示在标题栏右边
	 * @param {*} menu 
	 */
	addToolbarMenu(menu) {
		if (!menu || !menu.label || !menu.icon) {
			throw new TypeError(`[${this.#pluginName}]: label, icon, component is required!`);
		}

		if (!menu.component && !menu.click && !menu.src) {
			throw new TypeError(`[${this.#pluginName}]: [component, click, src] At least one must be configured!`);
		}

		// 包装一下
		if (menu.component) {
			menu.component = this.wrapComponent(menu.component);
		}

		useLayoutStore().addToolbarMenu(menu);
	}


	/**
	 * 创建状态栏项目
	 * @param {object} statusbar 状态栏配置对象
	 */
	addStatusbarItem(statusbar) {
		const { alignment = "right", priority = 0 } = statusbar;
		const statusbarItem = statusbarManager.addStatusbarItem(alignment, priority, {
			...statusbar,
			module: this.#pluginName,
		});

		return statusbarItem;
	}

	/**
	 * 注册一个数据源信息编辑组件
	 * @param { string } type 数据源类型
	 * @param { VueComponent } component Vue组件
	 * @param { object} options 选项，暂时没用
	 */
	addProjectUpdateComponent(projectUpdate) {
		const { type, component, label } = projectUpdate;
		if(!type || !component || !label) {
			throw new TypeError(`[${this.#pluginName}]: label, type, component is required!`);
		}
		const componentInfo = {
			id: type,
			type: type,
			label: label || type,
			component: this.wrapComponent(component),
			module: this.#pluginName,
		};
		projectManager.addProjectUpdateComponent(componentInfo);
	}

	/**
	 * 注册项目管理页面组件
	 * @param { string } projectType 项目类型
	 * @param { VueComponent|string } component Vue组件或全局组件名
	 * @param { object } options 选项
	 */
	addProjectPageComponent(projectPage) {
		const { type, component } = projectPage;
		if(!type || !component) {
			throw new TypeError(`[${this.#pluginName}]: type, component is required!`);
		}
		projectManager.addProjectPageComponent(type, this.wrapComponent(component), {
			...projectPage,
			module: this.#pluginName,
		});
	}

	/**
	 * 注册一个设置组件，方便用户配置
	 * @param {*} label 设置的标题
	 * @param {*} component vue组件
	 * @param {*} options 选项，暂时没用
	 */
	addPluginSettingPage(pluginSetttingPage) {
		const { label, component } = pluginSetttingPage;
		if(!label || !component) {
			throw new TypeError(`[${this.#pluginName}]: label, component is required!`);
		}
		settingsManager.addPluginSettingPage(label, this.wrapComponent(component), this.#pluginName, pluginSetttingPage);
	}


	/**
	 * 引用插件主进程暴露的对象，方便渲染进程调用主进程的方法
	 * @param {*} moduleName 模块名
	 * @returns target
	 */
	referenceService(moduleName) {
		return consumer.createProxy(`plugin.${this.#pluginName}.${moduleName}`);
	}

	geti18nRegistrar() {
		const pluginName = this.#pluginName;

		return {
			addLocaleMessage(locale, message) {
				// if(i18n.getLocaleMessage(locale)){
				//		throw new Error(`插件【${pluginName}】提供语言包【${locale}】已经存在，当前插件的语言包不会生效`);
				// }

				i18n.setLocaleMessage(locale, message);
			},

			addPluginLocaleMessage(locale, message) {
				const localeMessage = i18n.getLocaleMessage(locale);
				localeMessage.pluginLocale ??= {};
				localeMessage.pluginLocale[pluginName] = message;
				i18n.setLocaleMessage(locale, localeMessage);
			},
		};
	}	

	/**
	 * 打开一个简单的dialog，dialogInfo 里至少要有 component, 还可以有 title、width、height 等属性，具体可以参考 dialogHelper.openSimpleDialog 的参数
	 * @param {object} dialogInfo 对话框信息
	 * @returns {Promise} 对话框关闭时的 Promise，resolve 的值取决于对话框组件调用 closeDialog 时传入的参数
	 */
	openSimpleDialog(dialogInfo) {
		dialogInfo.component = this.wrapComponent(dialogInfo.component);
		return dialogHelper.openSimpleDialog(dialogInfo);
	}
	

	/**
	 * 开发一个dialog, dialogInfo 里至少要有 component, 还可以有 title、width、height 等属性，具体可以参考 dialogHelper.openDialog 的参数
	 * @param {object} dialogInfo 对话框信息
	 * @returns {Promise} 对话框关闭时的 Promise，resolve 的值取决于对话框组件调用 closeDialog 时传入的参数
	 */
	openDialog(dialogInfo) {
		dialogInfo.component = this.wrapComponent(dialogInfo.component);
		return dialogHelper.openDialog(dialogInfo);
	}

	/**
	 * 发送一个通知
	 * @param {*} data 
	 */
	notify(notifyInfo) {
		appRenderer.notify(notifyInfo);
	}


	/**
	 * 创建一个插件 vue 组件，插入到插件中每个组件中 mixins，提供一些基础能力
	 *  
	 *  可以给每个插件组件放置一些属性、方法
     *  但是尽量不要放置和组件生命周期相关的属性和方法，避免和组件本身的生命周期冲突
     *  能放到 appView 尽量放到给插件的 appView 上面
	 * 
	 * @returns 插件 vue 基础组件
	 */
	#createPluginMixinComponent() {
        const pluginName = this.#pluginName;
        return {

            /** 创建之前 */
            beforeCreate() {},

			/** 响应式属性 */
            computed: {

				/** 
				 * 提供一个获取插件自己的语言包函数，避免插件需要自己拼接，累人
				 */
                $pluginT() {
                    return function (key, ...args) {
                        return this.$t(`pluginLocale.${pluginName}.${key}`, ...args);
                    };
                }
            },

			/** 方法区 */
            methods: {}
        }
    }
}

export default AppRendererPlugin;
