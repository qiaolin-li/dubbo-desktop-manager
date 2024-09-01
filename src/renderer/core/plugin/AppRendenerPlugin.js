import Vue                      from 'vue'
import i18n                     from '@/renderer/common/i18n'
import appConfig                from "@/renderer/api/AppConfigClient.js";
import menuConfig               from '@/renderer/config/sidebarMenuList.js';
import PluginComponent          from './PluginComponent';


class AppRendererPluginCore {

    #module=null;
    #appRendererCore = null;

    constructor(appRendererCore, module) {
        this.#module = module;
        this.#appRendererCore = appRendererCore;

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


    component(name, component){
        let flag = false;
        for(let name1 in Vue.options.components) {
            if(name1.toLowerCase() === name.toLowerCase()) {
                console.warn(`component name conflict: ${name} and ${name1}`)
            }
        }
        if(!flag) {
            if(component.mixins && component.mixins.length > 0) {
                component.mixins.push(new PluginComponent(this.#module).get())
            }else {
                component.mixins = [new PluginComponent(this.#module).get()]
            }

            Vue.component(name, component)
        }
    }

    addMenu(location = 'top', menu) {
        if(!menu || !menu.label || !menu.icon) {
            throw new TypeError('label, icon, componentName is required!')
        }

        if(!menu.componentName && !menu.click) {
            throw new TypeError('componentName or click is required!')
        }

        if(location === 'top') {
            menuConfig.topMenu.push(menu)
        }else {
            menuConfig.bottomMenu.unshift(menu)
        }
    }

    registryPluginLocal(locale, message) {
        const localeMessage = i18n.getLocaleMessage(locale);
        localeMessage.pluginLocale ??= {};
        localeMessage.pluginLocale[this.#module] = message;
        i18n.setLocaleMessage(locale, localeMessage);
    }

    addPluginSettingComponent(componentInfo) {
        componentInfo.id = this.#module;
        componentInfo.name ??= this.#module;
        this.#appRendererCore.addPluginSettingComponent(componentInfo);
    }
    
    
    
}

export default AppRendererPluginCore