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

    async getReadMeFile(plugin) {
        if(plugin.source && plugin.source === 'local'){
            return fs.readFileSync(plugin.readme, 'utf8').toString();
        }
        const response = await axios.get(`https://cdn.jsdelivr.net/npm/${plugin.id}@${plugin.version}/README.md`);
        return response.data;
    }

    async install(plugin) {
        const pluginId = plugin.source === 'local' ? plugin.path : `${plugin.id}@${plugin.version}`;
        const result = await pluginSupplier.install(pluginId)

        await this.loader.load(plugin.id);
        return result;
    }

    async uninstall(pluginId) {
        try {
            const pluginInfo = pluginManager.get(pluginId);
            await pluginSupplier.uninstall(pluginId)

            pluginInfo.uninstall()
            pluginManager.remove(pluginId)
        } catch (error) {
            throw new Error(`插件卸载失败，错误日志为${error}`)
        }
    }

}


export default new Plugin();