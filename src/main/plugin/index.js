import fs                           from 'fs';
import { lt }                       from 'semver'
import { dialog }                   from 'electron'
import i18n                         from '@/main/common/i18n';   
import logger                       from '@/main/common/logger';
import apiExportor                  from '@/main/api/ApiExportor';
import appConfig                    from "@/main/common/config/appConfig.js";
import windowHolder                 from '@/main/common/holder/WindowHolder.js';
import pluginLoader                 from '@/main/plugin//PluginLoader.js'
import pluginManager                from "@/main/plugin/PluginManager.js";
import pluginInstaller              from "@/main/plugin/PluginInstaller.js";
import localPluginManager           from "@/main/plugin/LocalPluginManager.js";
import Constant                     from '@/main//common/Constant.js';

class Plugin {
    constructor() {
        apiExportor.registry("pluginManager", this);
    }

    async init() {
        await pluginLoader.init();
        
        let init = false;
        for (const pluginId in Constant.initPlugins) {
            const initVersion = Constant.initPlugins[pluginId];
            const plugin = pluginManager.get(pluginId);
            
            if(!plugin || !lt(plugin.version, initVersion)){
                try {
                    await this.install({
                        id: pluginId,
                        name: "Dubbo服务管理插件"
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
    
        // const pluginId  = "ddm-plugin-dubbo-support";
        // const key = `skip-init-plugin-${pluginId}`;
      
        // // 跳过当前版本
        // if (appConfig.getProperty(key)) {
        //   return;
        // }
        // 还是使用上面的无脑安装吧，避免用户没有安装插件
        // const plugin = pluginManager.get(pluginId);
        // if(!plugin) {
        //     dialog.showMessageBox({
        //         type: 'info',
        //         title: i18n.t("version.title"),
        //         buttons: [i18n.t("version.yes"), i18n.t("version.no")],
        //         message: "当前没有安装Dubbo服务管理插件，是否现在安装？",
        //         checkboxLabel: "我自行去插件市场安装，不再提示！",
        //         checkboxChecked: false,
        //         cancelId: 1
        //     }).then(async res => {
        //         if (res.response === 0) {
        //             await this.install({
        //                 id: pluginId,
        //                 name: "Dubbo服务管理插件"
        //             });
        //             logger.info("插件初始化完成！");
        //         }
        //         appConfig.setProperty(key, res.checkboxChecked)
        //     }).catch(e => {
        //         logger.error(e)
        //     });
        // }
    }


    addDevelopmentPlugin(pluginPath) {
        return localPluginManager.addDevelopmentPlugin(pluginPath)
    }

    removeDevelopmentPlugin(pluginPath) {
        return localPluginManager.removeDevelopmentPlugin(pluginPath)
    }

    getDevelopmentPluginList(keyword) {
        return localPluginManager.getDevelopmentPluginList(keyword)
    }

    getInstalledPluginList() {
        return pluginInstaller.getInstalledPluginList()
    }

    
    getInstalledPluginInfoList(){
        return pluginManager.getList();
    }

    
    discover(module, type) {
        logger.info(`给用户推荐插件[${module}][${type}, 开始`);
        // 通知渲染进程，弹起插件安装框
        windowHolder.send(`plugin-discovery`, {
            module, 
            type
        });

        logger.info(`给用户推荐插件[${module}][${type}, 结束`);
    }

    async install(plugin) {
        const result = await pluginInstaller.install(plugin)
        await pluginLoader.load(plugin.id);
        return result;
    }

    async uninstall(plugin) {
        try {
            const pluginInfo = pluginManager.get(plugin.id);
            await pluginInstaller.uninstall(plugin)

            pluginInfo.uninstall()
            pluginManager.remove(plugin.id)
        } catch (error) {
            throw new Error(`插件卸载失败，错误日志为${error}`)
        }
    }

    async getPluginModules() {
        const list = pluginManager.getList();

        const plugins = [];
        list.forEach((plugin) => {
            plugins.push({
                id: plugin.id,
                name: plugin.name,
                i18nPath: fs.existsSync(plugin.i18nPath) ? plugin.i18nPath : null,
                rendenerPath: fs.existsSync(plugin.rendenerPath) ? plugin.rendenerPath : null,
            })
        })
        return plugins;
    }
}


export default new Plugin();