/* eslint-disable no-unused-vars */
import consumer from './Consumer';

class PluginManagerClient {

    search(keyword){}

    addDevelopmentPlugin(pluginPath) {}

    removeDevelopmentPlugin(pluginPath) {}

    getDevelopmentPluginList(keyword){}
    
    getInstalledPluginList() { }

    getReadMeFile(plugin) {}

    install(plugin) {}

    load(plugins) {}

    uninstall(plugin) {}

    getPluginModules() {}
}


export default consumer.wrapper(new PluginManagerClient(), "pluginManager");