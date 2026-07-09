import fs                           from 'fs';
import path                         from 'path';
import { lt }                       from 'semver'
// import resolve                      from 'resolve'
import { Logger }                   from '@/main/common/logger';
import appConfig                    from "@/main/common/config/appConfig.js";
import Constant                     from '@/main//common/Constant.js';
import appCore                      from '@/main/AppCore.js';


const logger = new Logger("ddm-PluginInitializer");


/**
 * 插件系统初始化器
 *  1、加载已经安装的插件
 *  2、去安装当前版本需要的插件
 * 
 * @typedef {import('./PluginManager.js').default} PluginManager
 * @typedef {import('./PluginLoader.js').default} PluginLoader
 */
class PluginInitializer {

    /**
    * @param {PluginManager} pluginManager 插件管理器实例
    * @param {PluginLoader} pluginLoader 插件加载器实例
    */
    constructor(pluginManager, pluginLoader) {
        this.pluginManager = pluginManager;
        this.pluginLoader = pluginLoader;
    }

    /**
     * 初始化插件
     *  1、加载已经安装的插件
     *  2、去安装当前版本需要的插件
     */
    async init() {
        await this.syncPluginConfig();
        
        await this.loadPlugins();
    }


    async syncPluginConfig() {
        // await pluginInstaller.install({
        //     pluginId: "ddm-plugin-config",
        //     pluginName: "插件配置信息",
        // }, Constant.APPLICATION_PLUGIN_CONFIG_DIR);
    }

    /**
     * 初始化已安装的插件
     * @returns 
     */
    async loadPlugins() {
        const packagePath = path.join(Constant.APPLICATION_PLUGINS_DIR, 'package.json')
        if (!fs.existsSync(packagePath)) { // 如果不存在
            const pkg = {
                name: 'ddm-plugins',
                description: 'ddm-plugins',
                repository: 'https://github.com/qiaolin-li/dubbo-desktop-manager',
            }
            fs.writeFileSync(packagePath, JSON.stringify(pkg), 'utf8') 
        }

        const pluginDir = path.join(Constant.APPLICATION_PLUGINS_DIR, 'node_modules/')
        // 如果插件文件夹不存在，返回false
        if (!fs.existsSync(pluginDir)) { 
            return false
        }

        const json = JSON.parse(fs.readFileSync(packagePath)) // 读取package.json
        const pluginNameList = Object.keys(json.dependencies || {}).concat(Object.keys(json.devDependencies || {}));


        // 1.获取插件列表
        const pluginNames = pluginNameList.filter((name) => {
            if (!/^ddm-plugin-|^@[^/]+\/ddm-plugin-/.test(name)) return false

            // 获取插件路径
            return fs.existsSync(this.resolvePlugin(name))
        })

        if(pluginNames.length === 0) {
            return;
        }

        const pluginConfig = appConfig.getProperty('pluginConfig') || {};
        for (let index in pluginNames) {
            const pluginName = pluginNames[index]
            // 3.判断插件是否被禁用，如果是undefined则为新安装的插件，默认不禁用
            if (pluginConfig[pluginName] === false) { 
                continue;
            }
            try {
                const appPlugin = await this.pluginLoader.load(pluginName);

                // 3、注册到插件管理，以便后续使用
                this.pluginManager.register(appPlugin);
            } catch (error) {
                appCore.notify({
                    title: `插件[${pluginName}]加载失败`,
                    body: error.message,
                })
            }
        }
        logger.info(`插件已全部加载完成`);
    }

    /**
     * 确保内置插件存在，如果不存在就安装，版本过低就升级
     */
    async ensureBuiltinPlugins() {
        let init = false;
        for (const pluginName in Constant.initPlugins) {
            const initVersion = Constant.initPlugins[pluginName];
            const plugin = this.pluginManager.get(pluginName);
            
            if(!plugin || lt(plugin.version, initVersion)){
                try {
                    await this.pluginManager.install({
                        pluginId: `${pluginName}@${initVersion}`,
                        pluginName: pluginName,
                        version: initVersion
                    });
                } catch (error) {
                    logger.error("初始化插件失败，错误信息：", error);
                }
                    
                init = true;
            }
        }

        if(init) {
            logger.info("插件初始化完成！");
        }
    }

    resolvePlugin(name) { 
        // 获取插件路径
        return path.join(Constant.APPLICATION_PLUGINS_DIR, 'node_modules', name)
    }
}

export default PluginInitializer;
