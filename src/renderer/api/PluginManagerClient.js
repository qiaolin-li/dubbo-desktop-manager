/* eslint-disable no-unused-vars */
import consumer from './Consumer';

class PluginManagerClient {

    addDevelopmentPlugin(pluginPath) {}

    removeDevelopmentPlugin(pluginPath) {}

    getDevelopmentPluginList(){}
    
    getInstalledPluginList() { }

    getInstalledPluginInfoList(){}

    install(plugin) {}

    load(plugins) {}

    uninstall(plugin) {}

    getPluginModules() {}
}


export default consumer.wrapper(new PluginManagerClient(), "pluginManager");