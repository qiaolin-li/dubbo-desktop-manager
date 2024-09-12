import Vue                      from 'vue'
import myTabList                from '@/renderer/components/tabs/index.vue';
import yamlCodeEditor           from "@/renderer/components/editor/yaml-code-editor.vue";
import jsonCodeEditor           from "@/renderer/components/editor/json-code-editor.vue";
import copyButton               from "@/renderer/components/copyButton.vue";
import dragTab                  from '@/renderer/components/tabs/dragTab.vue';
import dragTabItem              from '@/renderer/components/tabs/dragTabItem.vue';
import dragTabToolBar           from '@/renderer/components/tabs/dragTabToolBar.vue';
import dataSource               from "@/renderer/api/DataSourceClient.js";
import invokeHisotryRecord      from "@/renderer/api/InvokeHistoryClient.js";
import excelExportUtils         from "@/renderer/api/ExcelExporterClient.js";
import appConfig                from "@/renderer/api/AppConfigClient.js";
import pluginManagerClient      from '@/renderer/api/PluginManagerClient';
import telnetTerminal           from "@/renderer/components/terminal/telnet-terminal.vue";
import loading                  from "@/renderer/common/utils/MyLoading";
import AppRendererPluginCore    from '@/renderer/core/plugin/AppRendenerPlugin.js';

const remote = require("@electron/remote");
// eslint-disable-next-line no-undef
const requireFunc = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require



class AppRendenerCore {

    #pluginMenuMap = new Map();
    #pluginSettingComponent = [];
    getPluginSettingComponentList = () => this.#pluginSettingComponent;
    
    #pluginDataSourceUpdateComponent = [];
    getPluginDataSourceUpdateComponentList = () => this.#pluginDataSourceUpdateComponent;

    
    #bus = new Vue();
    on = this.#bus.$on.bind(this.#bus);
    off = this.#bus.$off.bind(this.#bus);
    emit = this.#bus.$emit.bind(this.#bus);
    once = this.#bus.$once.bind(this.#bus);

    async init(Vue) {
        this.installCommonComponents(Vue);
        this.installCommonModules(Vue);
        await this.loadPlugin(Vue);
    }

    installCommonComponents (Vue) {
        Vue.component('copyButton', copyButton);
        Vue.component('telnetTerminal', telnetTerminal);
        Vue.component('myTabList', myTabList);
        Vue.component('dragTab', dragTab);
        Vue.component('dragTabItem', dragTabItem);
        Vue.component('dragTabToolBar', dragTabToolBar);
        Vue.component('jsonCodeEditor', jsonCodeEditor);
        Vue.component('yamlCodeEditor', yamlCodeEditor);
    }

    installCommonModules(Vue) {
        Vue.prototype.$remote = remote
        Vue.prototype.$appConfig = appConfig
        Vue.prototype.$dataSource = dataSource
        Vue.prototype.$invokeHisotryRecord = invokeHisotryRecord
        Vue.prototype.$excelExportUtils = excelExportUtils
        Vue.prototype.$loading = loading
        Vue.prototype.$appRenderer = this;
        Vue.prototype.$bus = this.#bus

        Vue.prototype.$writeClipboard = function(text) {
            navigator.clipboard.writeText(text)
            this.$message({
                type: "success",
                message: this.$t('editor.copySuccess'),
            });
        }
    }
    
    async loadPlugin () {
        const pluginInfos = await pluginManagerClient.getPluginModules();
        
        pluginInfos.forEach(async (plugin) => {
            try {
                // 1、创建插件核心对象
                const appPluginCore = new AppRendererPluginCore(this, plugin.name);

                // 2、加载插件国际化文件
                if(plugin.i18nPath) {
                    const i18nModule = requireFunc(plugin.i18nPath)(appPluginCore.geti18nRegistrar());
                    await i18nModule.install();
                }

                // 3、加载插件渲染逻辑
                if(plugin.rendenerPath) {
                    const module = requireFunc(plugin.rendenerPath)(appPluginCore);
                    await module.install();
                }
            } catch (error) {
                console.error(error);
            }
        })
    }
    

    /**
     * 
     * @param {object} menuConfig = {
     *  id, 唯一ID，可不填
     *  module, 输入哪个模块的菜单，必填
     *  group,  菜单放到哪个分组下，可不填 
     *  relativeMenu, 当前菜单放到哪个相对于哪个菜单的位置，可不填
     *  anchor,  放到哪个位置，可不填，取值为：first、last、before、after，存在relativeMenu时 fisrt、last才会生效
     *  test {function} ，条件函数，可不填，如果存在，返回true才会显示这个菜单
     *  menuInfo， 菜单信息（electron原生菜单）
     * }
     */
    addPluginMenu(menuConfig) {
        if (!menuConfig || !menuConfig.module) {
            console.error('plugin menu config error, module is required');
            return;
        }
        this.#pluginMenuMap.computeIfAbsent(menuConfig.module, () => []).push(menuConfig);
    }


    fillPluginMenu(module, menuTemplate, ...args) {
        const pluginMenuList = this.#pluginMenuMap.get(module) || [];
        if (!pluginMenuList || pluginMenuList.length <= 0) {
            return;
        }

        pluginMenuList.forEach((item) => {
            const {group, relativeMenu, anchor, test} = item;

            if(test && !test(...args)){
                return;
            }

            const menuInfo = {
                ...item.menuInfo,
                click: () => item.menuInfo.click && Reflect.apply(item.menuInfo.click, item.menuInfo, args)
            }

            let meuns = group ? (menuTemplate.find((m) => m.id === group) || {}).subMenus || [] : menuTemplate;
            
            if(['fisrt', 'last'].includes(anchor) || !relativeMenu){
                if(anchor === 'fisrt'){
                    meuns.unshift(menuInfo);
                } else {
                    meuns.push(menuInfo);
                }
                return;
            }
            
            const index = meuns.indexOf((m) => m.id === relativeMenu);
            if(index > -1 ){
                if(anchor === 'fisrt'){
                    meuns.splice(index, 0, menuInfo);
                } else {
                    meuns.splice(index+1, 0, menuInfo);
                }
            } else {
                meuns.push(menuInfo);
            }
        });
      }

    addDataSourceUpdateComponent(componentInfo) {
      this.#pluginDataSourceUpdateComponent.push(componentInfo);
    }

    addPluginSettingComponent(componentInfo) {
      componentInfo.id ??= this.#pluginSettingComponent.length + 1;
      
      this.#pluginSettingComponent.push(componentInfo);
    }
}

export default new AppRendenerCore(Vue);