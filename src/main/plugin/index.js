import fs                   from 'fs';
import axios                from 'axios';      
import PluginLoader         from './PluginLoader.js'
import pluginSupplier       from './supplier/index.js'
import pluginManager        from "@/main/plugin/PluginManager.js";

class Plugin {
    constructor() {
        this.loader = new PluginLoader()
    }

    search(keyword) {
        return pluginSupplier.search(keyword)
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


export default new Plugin();