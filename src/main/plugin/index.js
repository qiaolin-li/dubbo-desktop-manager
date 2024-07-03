import PluginContext        from './PluginContext.js'
import PluginLoader         from './PluginLoader.js'
import pluginSupplier       from './supplier/index.js'
import { Notification }     from 'electron'


class Plugin {
    constructor() {
        this.context = new PluginContext()
        this.loader = new PluginLoader(this.context)
    }

    search(keyword) {
        return pluginSupplier.search(keyword)
    }

    async install(plugin, version) {
        const result = await pluginSupplier.install(`${plugin}@${version}`)

        await this.loader.load(plugin);
       
        return result;
    }

    async uninstall(plugin) {
        try {
            await pluginSupplier.uninstall(plugin)
        } catch (error) {
            throw new Error(`插件卸载失败，错误日志为${error}`)
        }
    }

}


export default new Plugin();