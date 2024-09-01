/* eslint-disable no-unused-vars */
import consumer from './Consumer';

class Plugin {

    search(keyword){}

    getDevelopmentPluginList(keyword){}
    
    getInstalledPluginList(keyword) { }

    getReadMeFile(plugin) {}

    install(plugin) {}

    load(plugins) {}

    uninstall(plugin) {}

    getPluginRendererModules(pluginId) {}
}


export default consumer.wrapper(new Plugin(), "pluginManager");