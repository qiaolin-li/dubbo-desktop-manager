import fs                       from 'fs';
import axios                    from 'axios';
import i18n                     from '@/main/common/i18n';   
import appConfig                from "@/main/common/config/appConfig"
import constant                 from "@/main/common/Constant.js";
import { Logger }               from '@/main/common/logger';
import appCore                  from '@/main/AppCore.js';
import path                     from 'path';
import DBUtils                  from "@/main/common/utils/DBUtils.js";

/**
 * 应用插件实体，一个插件对应一个AppPlugin实例
 * 提供了插件的基本信息、常用方法
 */
class AppPlugin {

    /** 插件目录 */
    pluginDir;

    /** 插件 package.json 文件内容 */
    packageJson
    
    /** 插件ID,唯一坐标 ${pkg.name}@${pkg.version} */
    pluginId;

    /** 插件npm包名 pkg.name */
    pluginName;

    /** 插件名称，如果用户填了pluginName，就用用户填的，否则就是npm包名截取前缀后的的内容 */
    pluginNickName;

    /** 插件版本 */
    version;

    /** 插件作者 */
    author;

    /** 插件描述 */
    description;

    /** 插件logo */
    logo;

    /** 插件readme */
    readme;

    /** @type {string|null} 插件主入口文件 */
    mainPath = null;
    
    /** @type {string|null}  插件渲染器入口文件 */
    rendererPath = null;

    /** @type {string|null}  插件i18n入口文件 */
    i18nPath = null;

    constructor(pluginName) {
        this.pluginDir = path.join(constant.APPLICATION_PLUGINS_DIR, 'node_modules/', pluginName)
        const packageJson = this.packageJson = JSON.parse(fs.readFileSync(path.join(this.pluginDir, 'package.json')))

        /** 插件ID,唯一坐标 ${pkg.name}@${pkg.version} */
        this.pluginId = `${packageJson.name}@${packageJson.version}`;

        /** 插件npm包名 pkg.name */
        this.pluginName = packageJson.name;

        /** 插件名称，如果用户填了pluginName，就用用户填的，否则就是npm包名截取前缀后的的内容 */
        this.pluginNickName = packageJson.pluginNickName || packageJson.name.replace(`${constant.APPLICATION_PLUGINS_NAME_PREFIX}`, '');

        /** 插件版本 */
        this.version = packageJson.version;

        /** 插件作者 */
        this.author = packageJson.author || '未知作者';

        /** 插件描述 */
        this.description = packageJson.description;
        
        /** 插件logo */
        this.logo = 'file://' + path.join(this.pluginDir, 'logo.png');
        
        /** 插件readme */
        this.readme = 'file://' + path.join(this.pluginDir, 'README.md');
        
        this.sandboxConfig = packageJson.pluginSandbox || {};

        const mainPath     = path.join(this.pluginDir, packageJson.main || 'main.js');
        const rendererPath = path.join(this.pluginDir, packageJson.rendererMain || 'renderer.js')
        const i18nPath     = path.join(this.pluginDir, packageJson.i18nMain || 'i18n.js')

        // 防止文件不存在，如果文件不存在，认为没有入口
        if(fs.existsSync(mainPath)) this.mainPath = mainPath;
        if(fs.existsSync(rendererPath)) this.rendererPath = rendererPath;
        if(fs.existsSync(i18nPath)) this.i18nPath = i18nPath;

        /** 映射i18n的t方法，不让插件接触到i18n对象，防止被篡改 */
        this.t = i18n.t.bind(i18n);
        
        /** 插件的axios实例 */
        this.axios = axios;

        // 插件配置相关
        const getConfigKey       = (key) => `pluginConfig.${this.pluginName}.${key}`;
        this.appConfig = {
            
            /**
             * 是否存在某个配置
             * @param {string} key 
             * @returns 
             */
            hasProperty: (key) => appConfig.hasProperty(key),

            /**
             * 获取一个配置
             * @param {string} key 
             * @returns {any} 配置对象
             */
            getProperty: (key) => appConfig.getProperty(key),
            
            setPluginProperty   : (key, value) => appConfig.setProperty(getConfigKey(key), value),
            hasPluginProperty   : (key) => appConfig.hasProperty(getConfigKey(key)),
            getPluginProperty   : (key) => appConfig.getProperty(getConfigKey(key)),
            getPluginProperties : () => appConfig.getProperty(`pluginConfig.${this.pluginName}`),
        }

        /** 应用常量 */
        this.constant = constant;

        /** 插件日志对象，供插件输出日志 */
        this.logger = new Logger(`plugin[${pluginName}]`);

        // 操作方法
        this.notify = appCore.notify.bind(appCore);

        // 导出DBUtils类，供插件使用
        this.DBUtils = DBUtils;

        // 冻结对象，防止插件去修改
        Object.freeze(this);
    }
    
    
    /**
     * 映射插件的国际化语言
     * @param {string} key 
     * @param  {...any} args 
     * @returns 
     */
    pluginT(key, ...args) {
        return i18n.t(`pluginLocale.${this.pluginName}.${key}`, ...args)
    }

    /**
     * 暴露一个模块，供渲染进程调用
     * @param {string} moduleName 
     * @param {object} target 
     */
    exportPluginService(moduleName, target) {
        appCore.exportService(`plugin.${this.pluginName}.${moduleName}`, target);
    }
    
    /**
     * 卸载插件
     *  1、移除插件注册的数据源
     */
    uninstall() {
        // TODO 未来去触发插件的uninstall
    }

    /**
     * 
     * @returns 
     */
    geti18nRegistrar () {
        const pluginName = this.pluginName;
        return {
            addLocaleMessage(locale, message) {
                // try {
                //     if(i18n.getLocaleMessage(locale)) {
                //         throw new Error(`插件【${pluginName}】提供语言包【${locale}】已经存在，当前插件的语言包不会生效`);
                //     }
                // } catch (error){
                //     if(error.message !== 'Unexpected token u in JSON at position 0') {
                //         throw error;
                //     }
                // }

                i18n.setLocaleMessage(locale, message);
            },

            addPluginLocaleMessage(locale, message) {
                const localeMessage = i18n.getLocaleMessage(locale);
                if(!localeMessage.pluginLocale ){
                    localeMessage.pluginLocale = {};
                }
                localeMessage.pluginLocale[pluginName] = message;
                i18n.setLocaleMessage(locale, localeMessage);
            }
        }
    }
}

export default AppPlugin
