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

    async install(pluginId, version) {
        const result = await pluginSupplier.install(`${pluginId}@${version}`)

        await this.loader.load(pluginId);
       
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