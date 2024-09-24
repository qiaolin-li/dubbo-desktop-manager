import fs                           from 'fs';
import axios                        from 'axios';      
import PluginLoader                 from './PluginLoader.js'
import pluginSupplier               from './supplier/index.js'
import pluginManager                from "@/main/plugin/PluginManager.js";
import { dialog }                   from 'electron'
import i18n                         from '@/main/common/i18n';   
import logger                       from '@/main/common/logger';
import appConfig                    from "@/main/common/config/appConfig.js";
import apiExportor                  from '@/main/api/ApiExportor';

class Plugin {
    constructor() {
        this.loader = new PluginLoader()
        apiExportor.registry("pluginManager", this);
    }

    async init() {
        await this.loader.init();

        const pluginId  = "ddm-plugin-dubbo-support";
        const key = `skip-init-plugin-${pluginId}`;
      
        // 跳过当前版本
        if (appConfig.getProperty(key)) {
          return;
        }

        const plugin = pluginManager.get(pluginId);
        if(!plugin) {
            dialog.showMessageBox({
                type: 'info',
                title: i18n.t("version.title"),
                buttons: [i18n.t("version.yes"), i18n.t("version.no")],
                message: "当前没有安装Dubbo服务管理插件，是否现在安装？",
                checkboxLabel: "我自行去插件市场安装，不再提示！",
                checkboxChecked: false,
                cancelId: 1
            }).then(async res => {
                if (res.response === 0) {
                    await this.install({
                        id: pluginId,
                        name: "Dubbo服务管理插件"
                    });
                    logger.info("插件初始化完成！");
                }
                appConfig.setProperty(key, res.checkboxChecked)
            }).catch(e => {
                logger.error(e)
            });
        }
    }

    search(keyword) {
        return pluginSupplier.search(keyword)
    }

    addDevelopmentPlugin(pluginPath) {
        return pluginSupplier.addDevelopmentPlugin(pluginPath)
    }

    removeDevelopmentPlugin(pluginPath) {
        return pluginSupplier.removeDevelopmentPlugin(pluginPath)
    }

    getDevelopmentPluginList(keyword) {
        return pluginSupplier.getDevelopmentPluginList(keyword)
    }

    getInstalledPluginList() {
        return pluginSupplier.getInstalledPluginList()
    }

    async getReadMeFile(plugin) {
        if(plugin.source && plugin.source === 'local'){
            return fs.readFileSync(plugin.readme, 'utf8').toString();
        }
        const response = await axios.get(`https://cdn.jsdelivr.net/npm/${plugin.id}@${plugin.version}/README.md`);
        return response.data;
    }

    async install(plugin) {
        const result = await pluginSupplier.install(plugin)
        await this.loader.load(plugin.id);
        return result;
    }

    async uninstall(plugin) {
        try {
            const pluginInfo = pluginManager.get(plugin.id);
            await pluginSupplier.uninstall(plugin)

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


export default Plugin;