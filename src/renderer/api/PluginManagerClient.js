/* eslint-disable no-unused-vars */
import consumer from './Consumer';

class PluginManagerClient {

    addDevelopmentPlugin(pluginPath) {}

    removeDevelopmentPlugin(pluginPath) {}

    getDevelopmentPluginList(){}
    
    getInstalledPluginList() { }

    install(plugin) {}

    load(plugins) {}

    uninstall(plugin) {}

    getPluginModules() {}
}


export default consumer.wrapper(new PluginManagerClient(), "pluginManager");