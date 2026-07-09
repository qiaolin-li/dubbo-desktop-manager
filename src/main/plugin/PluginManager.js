import fs                           from 'fs-extra';
import { Logger }                   from '@/main/common/logger';
import appConfig                    from "@/main/common/config/appConfig.js";
import windowHolder                 from '@/main/window/WindowHolder.js';
import Constant                     from '@/main//common/Constant.js';

import LocalPluginManager           from "@/main/plugin/LocalPluginManager.js";
import PluginLoader                 from '@/main/plugin/PluginLoader.js'
import PluginInitializer            from "@/main/plugin/PluginInitializer.js";
import pluginInstaller              from "@/main/plugin/PluginInstaller.js";

const logger = new Logger("ddm-PluginManager");

/**
 * 插件管理器
 * 管理插件的安装、卸载、加载等操作
 * 
 * @typedef {import('./AppPlugin.js').default} AppPlugin
 */
class PluginManager {

    constructor() {
        /** @type {Object.<string, AppPlugin>} 已加载的插件列表 */
        this.list = {}
        this.ready = false;
        this.initPromise = null;

        this.pluginLoader = new PluginLoader(this);
        this.pluginInitializer = new PluginInitializer(this, this.pluginLoader);
        this.localPluginManager = new LocalPluginManager(this);
    }

    /**
     * 初始化插件
     */
    async init() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = (async () => {
            await this.pluginInitializer.init();
            this.ready = true;
        })();

        return this.initPromise;
    }

    async ensureReady() {
        if (this.ready) {
            return;
        }

        if (!this.initPromise) {
            await this.init();
            return;
        }

        if (this.initPromise) {
            await this.initPromise;
        }
    }

    /**
     * 增加本地插件
     * @param {string} pluginPath 插件路径
     * @returns 
     */
    addDevelopmentPlugin(pluginPath) {
        return this.localPluginManager.addDevelopmentPlugin(pluginPath)
    }

    /**
     * 移除本地插件
     * @param {string} pluginPath 本地插件路径
     * @returns 
     */
    removeDevelopmentPlugin(pluginPath) {
        return this.localPluginManager.removeDevelopmentPlugin(pluginPath)
    }

    /**
     * 获取本地插件列表
     * @returns 
     */
    getDevelopmentPluginList() {
        return this.localPluginManager.getDevelopmentPluginList()
    }

    /**
     * 获取已安装的插件列表
     * @returns 
     */
    async getInstalledPluginList() {
        await this.ensureReady();
        return this.getList().map((plugin) => ({
            pluginId: plugin.pluginId,
            pluginName: plugin.pluginName,
            pluginNickName: plugin.pluginNickName,
            path: plugin.pluginDir,
            author: plugin.author,
            description: plugin.description,
            logo: plugin.logo,
            readme: plugin.readme,
            installedVersion: plugin.version,
            installStatus: 'installed',
            version: plugin.version
        }));
    }
    
    /**
     * 插件发现，通知渲染进程，弹起插件安装框 
     * 主要是为了给用户推荐缺失的插件
     * @param {string} module 推荐什么模块的插件
     * @param {string} type 
     */
    discover(module, type) {
        logger.info(`给用户推荐插件 [${module}][${type}], 开始`);
        // 通知渲染进程，弹起插件安装框
        windowHolder.send(`plugin-discovery`, { module,  type });
        logger.info(`给用户推荐插件 [${module}][${type}], 结束`);
    }


    /**
     * 安装插件
     * @param {{pluginId: string, version?: string, pluginName?: string, source?: string, path?: string}} pluginInfo 需要安装的插件信息 
     * @returns 
     */
    async install(pluginInfo, where = Constant.APPLICATION_PLUGINS_DIR) {
        // 1、将插件安装到本地
        const result = await pluginInstaller.install(pluginInfo, where)

        // 2、加载插件
        const appPlugin = await this.pluginLoader.load(pluginInfo.pluginName, pluginInfo.path);
        if (!appPlugin) {
            return result;
        }

        // 3、注册到插件管理，以便后续使用
        this.register(appPlugin);
        return result;
    }

    /**
     * 卸载插件
     * @param {*} pluginInfo 
     */
    async uninstall(pluginInfo, where = Constant.APPLICATION_PLUGINS_DIR) {
        try {
            const appPlugin = this.get(pluginInfo.pluginName);
            await pluginInstaller.uninstall(appPlugin, where)

            await this.pluginLoader.unload(appPlugin)
            this.remove(appPlugin.pluginName)
        } catch (error) {
            throw new Error(`插件卸载失败，错误日志为${error}`)
        }
    }

    /**
     * 获取所有已加载插件的渲染进程模块、i18n模块
     * @returns 
     */
    async getPluginModules() {
        await this.ensureReady();
        return this.getList().map((plugin) => ({
            pluginId: plugin.pluginId,
            pluginName: plugin.pluginName,
            pluginNickName: plugin.pluginNickName,
            pluginDir: plugin.pluginDir,
            i18nPath: plugin.i18nPath,
            i18nContent: plugin.i18nPath && fs.existsSync(plugin.i18nPath) ? fs.readFileSync(plugin.i18nPath).toString('utf8') : null,
            rendererPath: plugin.rendererPath,
            rendererContent: plugin.rendererPath && fs.existsSync(plugin.rendererPath) ? fs.readFileSync(plugin.rendererPath).toString('utf8') : null,
        }))
    }

    /**
     * 插件注册的入口
     * @param {AppPlugin} plugin 
     */
    register (plugin) {
        if (!plugin) {
            return;
        }
        this.list[plugin.pluginName] = plugin
    }

    /**
     * 通过插件name获取插件
     * @param {string} pluginName  插件名称 ，pkg.name
     * @returns {AppPlugin} 插件信息
     */
    get (pluginName){
        return this.list[pluginName]
    }

    /**
     * 通过插件name删除插件
     * @param {string} pluginName 
     */
    remove (pluginName){
        delete this.list[pluginName]
    }

    /**
     * 获取插件列表
     * @returns {AppPlugin[]} 插件列表
     */
    getList (){
        return Object.keys(this.list).map((plugin) => this.list[plugin])
    }
}


export default new PluginManager();
