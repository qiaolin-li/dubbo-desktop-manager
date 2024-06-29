import PluginContext from './PluginContext.js'
import PluginLoader from './PluginLoader.js'
import PluginInstaller from './PluginInstaller.js'


class Plugin {
    constructor() {
        this.context = new PluginContext()
        this.loader = new PluginLoader(this.context)
        this.installer = new PluginInstaller(this.context)
    }

    async install(plugins) {
        await this.installer.install(plugins)
        await this.load(plugins);
        
    }

    async load(plugins) {
        return this.loader.load(plugins)
    }
}


export default new Plugin();