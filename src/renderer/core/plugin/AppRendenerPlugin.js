import Vue                      from 'vue'
import i18n                     from '@/renderer/common/i18n'
import appConfig                from "@/renderer/api/AppConfigClient.js";
import menuConfig               from '@/renderer/config/sidebarMenuList.js';
import PluginComponent          from './PluginComponent';
import myTabList                from '@/renderer/components/tabs/index.vue';

class AppRendererPluginCore {

    #module=null;
    #appRendererCore = null;
    #componentIndex = 0;

    // 给插件的组件添加一些属性和方法
    #componentMixins;
    #registryComponentMap = new Map();

    constructor(appRendererCore, module) {
        this.#module = module;
        this.#appRendererCore = appRendererCore;
        this.#componentMixins = new PluginComponent(this.#module).get();

        this.t = i18n.t.bind(i18n);
        this.pluginT = (key, ...args) => i18n.t(`pluginLocale.${module}.${key}`, ...args);

        this.addPluginMenu = this.#appRendererCore.addPluginMenu.bind(this.#appRendererCore);
        this.on = this.#appRendererCore.on.bind(this.#appRendererCore);
        this.off = this.#appRendererCore.off.bind(this.#appRendererCore);
        this.emit = this.#appRendererCore.emit.bind(this.#appRendererCore);
        this.once = this.#appRendererCore.once.bind(this.#appRendererCore);


        const getConfigKey = (module, key) => `pluginConfig.${module}.${key}`;
        this.setPluginProperty = (key, value) => appConfig.setProperty(getConfigKey(this.#module, key), value);
        this.hasPluginProperty = (key) => appConfig.hasProperty(getConfigKey(this.#module, key));
        this.getPluginProperty = (key) => appConfig.getProperty(getConfigKey(this.#module, key));
        this.getPluginProperties = () => appConfig.getProperties(`pluginConfig.${this.#module}`);
    }

    // 暂时不考虑开放，防止全局污染
    component(name, component){
        for(let name1 in Vue.options.components) {
            if(name1.toLowerCase() === name.toLowerCase()) {
                console.warn(`component name conflict: ${name} and ${name1}`)
            }
        }
        Vue.component(name, this.wrapComponent(component))
    }

    wrapComponent(component){
        if(typeof component !== 'object') {
            return component
        }

        // 防止重复包装
        if(component.mixins && component.mixins.find(mixin => mixin === this.#componentMixins)) {
            return component;
        }

        if(component.mixins && component.mixins.length > 0) {
            component.mixins.push(this.#componentMixins)
        }else {
            component.mixins = [ this.#componentMixins ]
        }

        const self = this;
        const Tab = Vue.extend({
            name: "my-tab-list",
            extends: myTabList,
            methods: {
                addTab(tabInfo) {
                    tabInfo.component = self.wrapComponent(tabInfo.component);
                    return this.$options.extends.methods.addTab.call(this, tabInfo);
                }
            }
        });

        if(component.components) {
            if(typeof component.components === 'object') {
                component.components["myTabList"] = Tab;
            } else if(component.components.length > 0) {
                component.components.unshift(Tab)
            } else {
                component.components = { myTabList: Tab}
            }
            
        } else {
            component.components = { myTabList: Tab}
        }

        return component;
    }

    addMenu(location = 'top', menu) {
        if(!menu || !menu.label || !menu.icon) {
            throw new TypeError('label, icon, component is required!')
        }

        if(!menu.component && !menu.click && !menu.src) {
            throw new TypeError('[component, click, src] At least one must be configured!')
        }

        if(location === 'top') {
            menuConfig.topMenu.push(menu)
        }else {
            menuConfig.bottomMenu.unshift(menu)
        }
    }

    /**
     * 注册一个数据源信息编辑组件
     * @param { string } type 数据源类型
     * @param { VueComponent } component Vue组件
     * @param { object} options 选项，暂时没用
     */
    // eslint-disable-next-line no-unused-vars
    registryDataSourceUpdateComponent(type, component, options) {
        const componentInfo = {
            id: type,
            type: type,
            label: options.label || type,
            component: this.wrapComponent(component),
            module: this.#module
        }
        this.#appRendererCore.addDataSourceUpdateComponent(componentInfo);
    }


    /**
     * 注册一个设置组件，方便用户配置
     * @param {*} label 设置的标题
     * @param {*} component vue组件
     * @param {*} options 选项，暂时没用
     */
    // eslint-disable-next-line no-unused-vars
    registrySettingComponent(label, component, options) {
        const componentInfo = {
            id: label,
            label: label,
            component: this.wrapComponent(component),
            module: this.#module
        }
        this.#appRendererCore.addPluginSettingComponent(componentInfo);
    }

    
    registryServicePageComponent(serviceType, component, options) {
        this.#appRendererCore.addServicePageComponent(serviceType, this.wrapComponent(component));
    }
    
    registryServicInvokeComponent(serviceType, component, options) {
        this.#appRendererCore.addServiceInvokeComponent(serviceType, this.wrapComponent(component));
    }
    
    
    geti18nRegistrar () {
        const module = this.#module;
        return {
            addLocaleMessage(locale, message) {
                try {
                    if(i18n.getLocaleMessage(locale)){
                        throw new Error(`插件【${module}】提供语言包【${locale}】已经存在，当前插件的语言包不会生效`);
                    }
                } catch (error){
                    if(error.message !== 'Unexpected token u in JSON at position 0') {
                        throw error;
                    }
                }

                i18n.setLocaleMessage(locale, message);
            },

            addPluginLocaleMessage(locale, message) {
                const localeMessage = i18n.getLocaleMessage(locale);
                localeMessage.pluginLocale ??= {};
                localeMessage.pluginLocale[module] = message;
                i18n.setLocaleMessage(locale, localeMessage);
            }
        }
    }
}

export default AppRendererPluginCore